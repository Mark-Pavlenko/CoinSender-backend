import { InvoicesItemsEntity } from './../model/invoicesItems.entity';
import { NodemailerService } from './../nodemailer/nodemailer.service';
import { InvoicesEntity } from './../model/invoices.entity';
import { Cache } from 'cache-manager';
import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, getConnection, Repository } from 'typeorm';
import { ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import RequestWithAdministrator from '../authentication/interfaces/administrator.interface';
import * as puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import handlebars from 'handlebars';
import { OrganizationService } from '../organization/organization.service';
import QRCode from 'qrcode';
import { checkEthWalletForValidity } from '../helpers';
@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(InvoicesEntity)
    private readonly invoiceEntity: Repository<InvoicesEntity>,
    private readonly configService: ConfigService,
    private readonly nodemailerService: NodemailerService,
    private readonly organizationService: OrganizationService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @InjectRepository(InvoicesItemsEntity)
    private readonly repoInvoicesItems: Repository<InvoicesItemsEntity>,
    private readonly connection: Connection,
  ) {}

  private static getFullDate(date: string) {
    const fullDate = new Date(date);
    const allMonthes = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const month = fullDate.getMonth();

    return (
      allMonthes[month] +
      ' ' +
      fullDate.getDate() +
      ' ' +
      fullDate.getFullYear()
    );
  }

  private static generateInvoiceNumber() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  private async setInvoiceNumber(orgId: string, randomNum: number) {
    return this.cacheManager.set(orgId + '-' + randomNum, randomNum, {
      ttl: this.configService.get('TTl'),
    });
  }

  private async getInvoiceNumber(orgId: string) {
    return this.cacheManager.get(orgId);
  }

  public async draftInvoiceNumber(orgId: string, randomNum: number) {
    const cachedItem = await this.getInvoiceNumber(orgId + '-' + randomNum);

    const invoiceInDb = await this.invoiceEntity.findOne({
      where: {
        organization_id: orgId,
      },
    });

    if (
      cachedItem === null ||
      invoiceInDb === undefined ||
      cachedItem !== randomNum
    ) {
      await this.setInvoiceNumber(orgId, randomNum);
      return randomNum;
    } else {
      await this.draftInvoiceNumber(
        orgId,
        InvoicesService.generateInvoiceNumber(),
      );
    }
  }

  @ApiOperation({ summary: 'Get all employees' })
  public async getId(orgId: string) {
    const randomNum = InvoicesService.generateInvoiceNumber();
    return this.draftInvoiceNumber(orgId, randomNum);
  }

  public async getInvoiceById(organization_id: string, invoice_number: number) {
    const invoice = await this.invoiceEntity.findOne({
      where: {
        organization_id: organization_id,
        invoice_number: invoice_number,
      },
      relations: ['invoice_items'],
    });

    const organization = await this.organizationService.findById(
      invoice.organization_id,
    );

    return { ...invoice, organization };
  }

  @ApiOperation({ summary: 'Get all employees' })
  public async getAll(orgId: string) {
    return await this.invoiceEntity.find({
      relations: ['invoice_items'],
      where: {
        organization_id: orgId,
      },
    });
  }

  public async compile(templateName, data) {
    const filePath = path.join(
      process.cwd(),
      `${this.configService.get('EMAIL_TEMPLATE_FOLDER')}`,
      `${templateName}.hbs`,
    );

    data.created_date = InvoicesService.getFullDate(data.created_date);
    data.due_date = InvoicesService.getFullDate(data.due_date);

    handlebars.registerHelper('optional', function () {
      return 'none';
    });

    const html = await fs.readFile(filePath, 'utf8');
    return handlebars.compile(html)(data);
  }

  public async createPdf(
    template: string,
    invoice: InvoicesEntity,
    employeeObj: RequestWithAdministrator,
  ) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(template);

    const pdf = await page.pdf({
      path: `${this.configService.get('INVOICES_PDF')}/${
        employeeObj.user.organization_id + '-' + invoice.invoice_number
      }.pdf`,
      format: 'A4',
      printBackground: true,
    });
    await browser.close();
    return pdf;
  }

  @ApiOperation({ summary: 'Create invoice' })
  public async create(employeeObj: RequestWithAdministrator, invoice) {
    if (
      !checkEthWalletForValidity(invoice.wallet) ||
      !checkEthWalletForValidity(invoice.wallet_client)
    ) {
      throw new HttpException(
        'One or both of the wallets are not valid.',
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedInvoice: Record<string, any> = invoice;

    const qrImage = await QRCode.toDataURL(invoice.wallet);

    updatedInvoice.qr_image = qrImage;

    const company = await this.organizationService.findCompany(
      employeeObj.user.organization_id,
    );
    updatedInvoice.company_name = company.company_name;
    updatedInvoice.phone = employeeObj.user.phone;

    const template = await this.compile('index', updatedInvoice);
    const pdf = await this.createPdf(template, invoice, employeeObj);

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      invoice.organization_id = employeeObj.user.organization_id;
      invoice.qr_code = qrImage;

      const inv = await this.invoiceEntity.save(invoice);

      const invoices_items = invoice.invoice_items.map((el) => {
        el.invoice_number = inv.id;
        return el;
      });

      await this.repoInvoicesItems.save(invoices_items);

      await this.nodemailerService.sendInvoiceMessageEmail(
        invoice.email,
        invoice.email_client,
        'Invoice by CoinSender',
        `Invoice №${invoice.invoice_number}.pdf`,
        pdf,
      );

      await this.invoiceEntity.update(inv.id, {
        status: true,
        pdf_name:
          employeeObj.user.organization_id + '-' + invoice.invoice_number,
      });

      await queryRunner.commitTransaction();

      return { status: 200, message: 'Invoice was created successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getAllAdminInvoices(organization_id: string) {
    return await this.invoiceEntity.find({
      where: { organization_id },
      relations: ['invoice_items'],
    });
  }
}
