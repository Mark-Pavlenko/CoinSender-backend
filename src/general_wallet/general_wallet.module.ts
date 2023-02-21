import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralWalletService } from './general_wallet.service';
import { GeneralWalletController } from './general_wallet.controller';
import { CryptoService } from '../crypto/crypto.service';
import { ConfigModule } from '@nestjs/config';
import { GeneralWalletEntity } from '../model/general_wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeneralWalletEntity]), ConfigModule],
  providers: [GeneralWalletService, CryptoService],
  controllers: [GeneralWalletController],
  exports: [],
})
export class GeneralWalletModule {}
