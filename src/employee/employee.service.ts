import {
  forwardRef,
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeEntity } from '../model/employee.entity';
import { TransfersService } from '../transfers/transfers.service';
import { IsNull, Repository } from 'typeorm';
import { ApiOperation } from '@nestjs/swagger';
import { nanoid } from 'nanoid';
import {
  deleteFileName,
  transfersUploadingParser,
} from '../helpers/fileManager';
import {
  checkEthWalletForValidity,
  checkTransferDataOnValidityType,
  transfersWithSimilarWallets,
} from '../helpers';
import { TransfersEntity } from '../model/transfers.entity';
import { ParsedDataDto } from '../helpers/interfaces/transferUploadParsedDataDto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employeeEntity: Repository<EmployeeEntity>,
    @Inject(forwardRef(() => TransfersService))
    private readonly transfersService: TransfersService,
    @InjectRepository(TransfersEntity)
    private readonly transfersEntity: Repository<TransfersEntity>,
  ) {}

  @ApiOperation({ summary: 'Get all employees' })
  public async getAll(orgId: string) {
    return await this.employeeEntity.find({
      where: {
        organization_id: orgId,
      },
    });
  }

  @ApiOperation({ summary: 'Get all employees' })
  public async getAllEmployees(orgId: string) {
    return await this.employeeEntity
      .createQueryBuilder()
      .select(['organization_id', 'wallet_id'])
      .where('organization_id = :organization_id', {
        organization_id: orgId,
      })
      .execute();
  }

  @ApiOperation({ summary: 'Create employee' })
  public async create(
    avatar,
    employee: EmployeeEntity,
    organization_id: string,
  ) {
    const createdEmployee = {
      ...employee,
      organization_id,
      avatar_url: avatar == null || undefined ? null : avatar?.filename,
      transfer_id: nanoid(),
    };

    return await this.employeeEntity.save(createdEmployee);
  }

  @ApiOperation({ summary: 'Get by ID' })
  public async findById(id: number): Promise<EmployeeEntity[]> {
    return await this.employeeEntity.findByIds([id]);
  }

  @ApiOperation({ summary: 'Add employee and transaction from file' })
  public async createFromFile(user, file) {
    const parsedData: ParsedDataDto[] = await transfersUploadingParser(file);

    const parsedDataWithAllKeysValuePairs = parsedData.map((el) => {
      return checkTransferDataOnValidityType(el);
    });

    if (parsedDataWithAllKeysValuePairs.includes(false)) {
      throw new HttpException(
        'The uploading file has got the wrong structure or do not ' +
          'have one of required values - name, second_name, wallet_id, amount.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (transfersWithSimilarWallets(parsedData)) {
      throw new HttpException(
        'Please, remove duplicate wallets from uploading data.',
        HttpStatus.FORBIDDEN,
      );
    }

    const checkWalletsForValidity = parsedData.map((el) => {
      return checkEthWalletForValidity(el.wallet_id);
    });

    if (checkWalletsForValidity.includes(false)) {
      throw new HttpException(
        'Please, check all wallets for validity.',
        HttpStatus.FORBIDDEN,
      );
    }

    /* const existingAdminTransfers = await this.transfersEntity.find({
      where: {
        organization_id: user.organization_id,
        hash: null,
      },
    }); */

    const notProcessedExistWalletsTransfers = parsedData;
    const formatUploadingData = notProcessedExistWalletsTransfers.map((el) => ({
      ...el,
      organization_id: user.organization_id,
      transfer_id: nanoid(),
    }));

    /* const notProcessedExistWalletsTransfers = parsedData.map((el) => {
      return existingItemsWithSpecificWallets(el, existingAdminTransfers);
    });

    if (notProcessedExistWalletsTransfers.includes(true)) {
      throw new HttpException(
        'Non-processed transfers with one of uploading wallets are already exist.',
        HttpStatus.FORBIDDEN,
      );
    } 

    const formatUploadingData = notProcessedExistWalletsTransfers.map((el) => ({
      ...el,
      organization_id: user.organization_id,
      transfer_id: nanoid(),
    }));
    .filter((item) => item !== true);*/

    await this.transfersService.create(formatUploadingData);

    const existingEmployees = [];
    for (const user of formatUploadingData) {
      existingEmployees.push(
        await this.employeeEntity.findOne({
          where: {
            wallet_id: user.wallet_id,
          },
        }),
      );
    }

    /*const filteredExistedEmployees = existingEmployees.filter(
      (item) => item !== undefined,
    );

     const newEmployees = formatUploadingData
      .map((el) => {
        return existingItemsWithSpecificWallets(el, filteredExistedEmployees);
      })
      .filter((item) => item !== true); */

    for (const item of /* newEmployees */ formatUploadingData) {
      await this.employeeEntity
        .createQueryBuilder()
        .insert()
        .orIgnore()
        .values([item])
        .execute();
    }

    return formatUploadingData;
  }

  @ApiOperation({ summary: 'Edit employee' })
  public async edit(avatar, employeeData, orgId: string) {
    const employee = await this.employeeEntity.findOne({
      where: { id: employeeData.id, organization_id: orgId },
    });

    if (
      (employeeData.avatar_url == 'null' && employee.avatar_url !== null) ||
      avatar !== undefined
    ) {
      await deleteFileName(employee.avatar_url);
    }

    let totalAvatar;

    if (avatar !== undefined) {
      totalAvatar = avatar?.filename;
    } else if (employeeData.avatar_url == 'null') {
      totalAvatar = null;
    } else if (employeeData.avatar_url !== 'null') {
      totalAvatar = employee.avatar_url;
    }

    await this.employeeEntity.update(employee.id, {
      name: employeeData.name,
      second_name: employeeData.second_name,
      wallet_id: employeeData.wallet_id,
      add_info: employeeData.add_info,
      position: employeeData.position,
      avatar_url: totalAvatar,
    });
  }

  @ApiOperation({ summary: 'Add avatar fro employee' })
  public async addAvatar(employeeData, orgId: string, employeeId: number) {
    return await this.employeeEntity
      .createQueryBuilder()
      .update()
      .set({
        avatar_url: employeeData.avatar_url,
      })
      .where('id = :id', {
        id: employeeId,
      })
      .andWhere('organization_id = :organization_id', {
        organization_id: orgId,
      })
      .execute();
  }

  public async changeEmployeeActivityStatus(
    employee_id: number,
    isArchived: boolean,
  ) {
    await this.employeeEntity
      .createQueryBuilder()
      .update()
      .set({
        isArchived: isArchived,
      })
      .where('id = :id', {
        id: employee_id,
      })
      .execute();

    return this.findById(employee_id);
  }

  @ApiOperation({ summary: 'Remove employee from db' })
  public async removeEmployee(employee_id: number) {
    try {
      const employeeForDeleting: EmployeeEntity =
        await this.employeeEntity.findOne({
          where: { id: employee_id },
        });

      if (!employeeForDeleting) {
        return new HttpException(
          'Employee with this id does not exist.',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.transfersEntity.delete({
        wallet_id: employeeForDeleting.wallet_id,
        hash: IsNull(),
      });

      if (employeeForDeleting.avatar_url !== null) {
        await deleteFileName(employeeForDeleting.avatar_url);
      }

      await this.employeeEntity.delete(employee_id);

      return {
        success: true,
        message: `The employee with id ${employee_id} was successfully removed from system`,
      };
    } catch (err) {
      throw new HttpException(
        `${err.detail}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
