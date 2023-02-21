import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpException,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentEntity } from '../model/payment.entity';
import RoleGuard from '../authentication/guards/role.guard';
import RoleEnum from '../authentication/enum/role.enum';
import { Transfers } from '../payment/transfers.interface';
 

@UseGuards(RoleGuard(RoleEnum.admin))
@Controller('payment')
export class PaymentController {
  constructor(private serv: PaymentService) {}

  @Get('/transactions')
  @ApiOperation({ summary: 'Get all payments' })
  public async getAll(@Query() query) {
    return await this.serv.getAll(query.id);
  }

  @Get('/balance/:id')
  @ApiOperation({ summary: 'Get key' })
  public async getBalance(@Param() id: string) {
    return await this.serv.getBalance(id);
  }

  @Post('/mint')
  @ApiOperation({ summary: 'Mint money' })
  public async mint(@Body() address: string) {
    return await this.serv.mint(address);
  }

  @Post()
  @ApiOperation({ summary: 'Create item' })
  public async create(@Body() employee: PaymentEntity) {
    return await this.serv.create(employee);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: PaymentEntity,
  })
  public async findOne(@Param() id: number): Promise<PaymentEntity[]> {
    return await this.serv.findById(id);
  }

  @Post('/savetransaction')
  @ApiOperation({ summary: 'Create item' })
  public async savetransaction(@Body() transaction: Transfers) {
    const foundHash = await this.serv.findByHashId(transaction.hash);
    if (foundHash) {
      throw new HttpException(
        'You have already added transaction',
        HttpStatus.CREATED,
      );
    }

    return await this.serv.saveTransaction(
      transaction.hash,
      transaction.transfers,
    );
  }
}
