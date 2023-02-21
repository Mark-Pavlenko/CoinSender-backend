import { PaymentEntity } from './../model/payment.entity';
import { EmployeeEntity } from './../model/employee.entity';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransfersEntity } from '../model/transfers.entity';
import { Repository, In, IsNull } from 'typeorm';
import { ApiOperation } from '@nestjs/swagger';
import { EmployeeService } from '../employee/employee.service';
import { nanoid } from 'nanoid';
import { removeExistingObjectsByWalletId } from '../helpers';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(TransfersEntity)
    private readonly transfersEntity: Repository<TransfersEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeEntity: Repository<EmployeeEntity>,
    @Inject(forwardRef(() => EmployeeService))
    private readonly employeeService: EmployeeService,
  ) {}

  @ApiOperation({ summary: 'Get all transfers' })
  public async getAll(user, status) {
    console.log('user.organization_id', user.organization_id);

    const flag =
      status === true ? 'transfers.hash IS NOT NULL' : 'transfers.hash IS NULL';

    const transfers: any = await this.transfersEntity
      .createQueryBuilder('transfers')
      .select('transfers')
      .where('transfers.organization_id = :organization_id', {
        organization_id: user.organization_id,
      })
      .andWhere(flag)
      .leftJoinAndMapOne(
        'transfers.payment',
        PaymentEntity,
        'payment',
        'payment.hash = transfers.hash',
      )
      .leftJoinAndMapOne(
        'transfers.employee',
        EmployeeEntity,
        'employee',
        'employee.wallet_id = transfers.wallet_id',
      )
      .getMany();

    return {
      transfers,
      name: user.name,
      second_name: user.second_name,
    };
  }

  @ApiOperation({ summary: 'Get all transfers' })
  public async update(transfer, orgId) {
    return await this.transfersEntity
      .createQueryBuilder()
      .update()
      .set({ amount: transfer.amount, notes: transfer.notes })
      .where('transfer_id = :transfer_id', {
        transfer_id: transfer.transfer_id,
      })
      .andWhere('organization_id = :organization_id', {
        organization_id: orgId,
      })
      .execute();
  }

  @ApiOperation({ summary: 'Create transfers' })
  public async create(transfer) {
    return await this.transfersEntity
      .createQueryBuilder()
      .insert()
      .values(transfer)
      .execute();
  }

  @ApiOperation({ summary: 'Create transfers from db (Employees)' })
  public async createFromDb(orgId) {
    const users = await this.employeeService.getAllEmployees(orgId);
    const newTransfers = users.map((el) => {
      el.transfer_id = nanoid();
      el.amount = 1;
      return el;
    });

    console.log('newTransfers', newTransfers);

    const existedTransfers = await this.transfersEntity.find({
      where: {
        organization_id: orgId,
        hash: IsNull(),
      },
    });

    console.log('existingTransfers', existedTransfers);

    const filteredTransfers = removeExistingObjectsByWalletId(
      existedTransfers,
      newTransfers,
    );

    console.log('filteredTransfers', filteredTransfers);

    await this.transfersEntity.save(filteredTransfers);
    return this.transfersEntity.find();
  }

  @ApiOperation({ summary: 'Delete transfers' })
  public async delete(transfer) {
    return await this.transfersEntity
      .createQueryBuilder()
      .delete()
      .where('transfer_id = :transfer_id', {
        transfer_id: transfer.transfer_id,
      })
      .execute();
  }

  @ApiOperation({ summary: 'Add hash' })
  public async addHash(hash, transfers) {
    return await this.transfersEntity.update(
      {
        transfer_id: In(transfers),
      },
      { hash: hash },
    );
  }

  @ApiOperation({ summary: 'Delete several transfers by their ids' })
  public async deleteMultipleTransfers(transfersIds: Array<number>) {
    try {
      const allTransfers = await this.transfersEntity.findByIds(transfersIds);

      const existTransfersIds = [];
      allTransfers.forEach((el) => {
        existTransfersIds.push(el.id);
      });

      if (existTransfersIds.length == 0) {
        return new HttpException(
          'Transfers with this IDs do not exist',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.transfersEntity.delete(transfersIds);
      return {
        success: true,
        message: `The transfers with IDs ${existTransfersIds} were successfully removed.`,
      };
    } catch (err) {
      throw new HttpException(
        `${err.detail}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'find all transfers by admin organization id' })
  public async getAllTransfersByOrgWalletId(orgId: string, wallet_id: string) {
    return await this.transfersEntity.findOne({
      where: { organization_id: orgId, wallet_id },
    });
  }
}
