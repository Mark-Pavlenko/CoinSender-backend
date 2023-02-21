import { InvoicesEntity } from './../model/invoices.entity';
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  UsePipes,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import RoleGuard from '../authentication/guards/role.guard';
import RoleEnum from '../authentication/enum/role.enum';
import RequestWithAdministrator from '../authentication/interfaces/administrator.interface';
import { ValidationPipe } from '../pipes/validation.pipe';
import JwtAuthenticationGuard from '../authentication/guards/authentication.guard';
import { createInvoice } from '../types/createInvoice';
 

@UseGuards(JwtAuthenticationGuard)
@UseGuards(RoleGuard(RoleEnum.admin))
@Controller('invoices')
export class InvoicesController {
  constructor(private invoceService: InvoicesService) {}

  @Get('getallinvoices')
  @ApiResponse({
    status: 200,
    description: 'User object',
    type: InvoicesEntity,
  })
  @ApiOperation({ summary: 'Get all invoices' })
  public async getAllInvoices(@Req() req: RequestWithAdministrator) {
    return this.invoceService.getAll(req.user.organization_id);
  }

  @Get('admin-invoices')
  @ApiResponse({
    status: 200,
    description: 'Invoices array of objects',
    type: [InvoicesEntity],
  })
  @ApiOperation({ summary: 'Get all admin invoices by his id' })
  public async getAllAdminInvoices(@Req() req: RequestWithAdministrator) {
    return this.invoceService.getAllAdminInvoices(req.user.organization_id);
  }

  @Get('getinvoicenumber')
  @ApiResponse({
    status: 200,
    description: 'Invoice number',
  })
  @ApiOperation({ summary: 'Get id invoice' })
  public async getIdInvoice(@Req() req: RequestWithAdministrator) {
    return this.invoceService.getId(req.user.organization_id);
  }

  @Post('create')
  @UsePipes(new ValidationPipe(createInvoice))
  @ApiResponse({
    status: 200,
    description: 'Invoice created successfull',
  })
  @ApiOperation({ summary: 'Create invoice' })
  public async create(
    @Body() invoice: InvoicesEntity,
    @Req() req: RequestWithAdministrator,
  ) {
    return await this.invoceService.create(req, invoice);
  }

  @Post('by-id')
  @ApiOperation({
    summary: 'Get invoice by id',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice object',
    type: InvoicesEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  public async getInvoiceById(
    @Body() body: { organization_id: string; invoice_number: number },
  ) {
    return this.invoceService.getInvoiceById(
      body.organization_id,
      body.invoice_number,
    );
  }
}
