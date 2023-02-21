import { AdministratorsModule } from './../administrators/administrators.module';
import { forwardRef, Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { OrganizationModule } from '../organization/organization.module';
import { AuthenticationController } from './authentication.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategy/refresh.strategy';
import { CryptoModule } from '../crypto/crypto.module';
import { CryptoService } from '../crypto/crypto.service';
import { TokenModule } from '../token/token.module';
import { TokenService } from '../token/token.service';
import { GoogleAuthModule } from './google-auth/google-auth.module';
import { GoogleAuthService } from './google-auth/google-auth.service';
import { AdministratorsService } from '../administrators/administrators.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministratorsEntity } from '../model/administrator.entity';
import { NodemailerModule } from '../nodemailer/nodemailer.module';
import { WalletEntity } from '../model/wallet.entity';
import { GeneralWalletEntity } from '../model/general_wallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [AdministratorsEntity, WalletEntity],
    ),
    AdministratorsModule,
    PassportModule,
    ConfigModule,
    OrganizationModule,
    CryptoModule,
    TokenModule,
    GoogleAuthModule,
    NodemailerModule,
    GeneralWalletEntity,
    JwtModule.register({}),
  ],
  providers: [
    AuthenticationService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    CryptoService,
    TokenService,
    GoogleAuthService,
    AdministratorsService,
  ],
  controllers: [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
