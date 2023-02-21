import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletEntity } from '../model/wallet.entity';
import { CryptoService } from '../crypto/crypto.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([WalletEntity]), ConfigModule],
  providers: [WalletService, CryptoService],
  controllers: [WalletController],
  exports: [],
})
export class WalletModule {}
