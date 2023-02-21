import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GeneralWalletService } from './general_wallet.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WalletEntity } from '../model/wallet.entity';
import { GeneralWalletEntity } from '../model/general_wallet.entity';
import RequestWithAdministrator from '../authentication/interfaces/administrator.interface';
import JwtAuthenticationGuard from '../authentication/guards/authentication.guard';

@UseGuards(JwtAuthenticationGuard)
@Controller('general-wallets')
export class GeneralWalletController {
  constructor(private generalWalletsService: GeneralWalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get all general invoice wallets' })
  public async getAllGeneralWallets() {
    return await this.generalWalletsService.getAllGeneralWallets();
  }

  @Post('bind')
  @ApiOperation({ summary: 'Add general invoice wallet to specific admin' })
  public async addGeneralWallet(
    @Req() req: RequestWithAdministrator,
    @Body() body: GeneralWalletEntity,
  ) {
    return await this.generalWalletsService.addGeneralWallet(req.user, body);
  }

  @Patch('edit')
  @ApiOperation({ summary: 'Edit general wallet' })
  public async editTransfer(@Body() body: GeneralWalletEntity) {
    return await this.generalWalletsService.updateGeneralWallet(body);
  }

  @Get('/organization-id/:organization_id')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: WalletEntity,
  })
  public async findAllWalletsByOrgId(
    @Param() params: { organization_id: string },
  ) {
    return await this.generalWalletsService.findAllWalletsByOrgId(
      params.organization_id,
    );
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
  @Delete('delete')
  public async deleteGeneralWallet(@Body() reqBody: { id: number }) {
    return this.generalWalletsService.deleteGeneralWallet(+reqBody.id);
  }
}
