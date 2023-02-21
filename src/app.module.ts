import { InvoicesModule } from './invoices/invoices.module';
import { TransfersModule } from './transfers/transfers.module';
import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './config/config.service';
import { EmployeeModule } from './employee/employee.module';
import { OrganizationModule } from './organization/organization.module';
import { PaymentModule } from './payment/payment.module';
import { WalletModule } from './wallet/wallet.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { GoogleAuthModule } from './authentication/google-auth/google-auth.module';
import { CryptoModule } from './crypto/crypto.module';
import { TokenModule } from './token/token.module';
import { ClientModule } from './client/client.module';
import { GeneralWalletModule } from './general_wallet/general_wallet.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: configService.getRedisHost(),
      port: configService.getRedisPort(),
    }),
    AuthenticationModule,
    ClientModule,
    CryptoModule,
    EmployeeModule,
    GeneralWalletModule,
    GoogleAuthModule,
    InvoicesModule,
    OrganizationModule,
    PaymentModule,
    TransfersModule,
    TokenModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
