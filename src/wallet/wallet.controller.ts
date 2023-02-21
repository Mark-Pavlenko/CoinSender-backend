import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WalletEntity } from '../model/wallet.entity';

@Controller('wallets')
export class WalletController {
  constructor(private serv: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get all wallets' })
  public async getAll() {
    return await this.serv.getAll();
  }

  @Post('bind')
  @ApiOperation({ summary: 'Create item' })
  public async bindWalletToAdmin(@Body() body) {
    return await this.serv.bindWalletToAdmin(body);
  }

  @ApiOperation({ summary: 'Remove client by ID' })
  @ApiResponse({
    status: 204,
    description: 'The client with id "id" was successfully removed from system',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Delete()
  public async deleteWallet(@Body() reqBody: { id: number }) {
    return this.serv.deleteWallet(+reqBody.id);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: WalletEntity,
  })
  public async findOne(@Param() id: number): Promise<WalletEntity[]> {
    return await this.serv.findById(id);
  }
}
