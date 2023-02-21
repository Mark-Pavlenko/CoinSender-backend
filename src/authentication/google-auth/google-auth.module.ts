import { GoogleStrategy } from '../strategy/google.strategy';
import { forwardRef, Module } from '@nestjs/common';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleAuthService } from './google-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministratorsModule } from '../../administrators/administrators.module';
import { AdministratorsService } from '../../administrators/administrators.service';
import { AdministratorsEntity } from '../../model/administrator.entity';
import { AuthenticationService } from '../authentication.service';
import { AuthenticationModule } from '../authentication.module';
import { LocalStrategy } from '../strategy/local.strategy';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { JwtRefreshTokenStrategy } from '../strategy/refresh.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { CryptoModule } from '../../crypto/crypto.module';
import { TokenModule } from '../../token/token.module';
import { TokenService } from '../../token/token.service';
import { NodemailerModule } from '../../nodemailer/nodemailer.module';
import { WalletEntity } from '../../model/wallet.entity';
import { OrganizationService } from '../../organization/organization.service';
import { OrganizationEntity } from '../../model/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdministratorsEntity,
      WalletEntity,
      OrganizationEntity,
    ]),
    PassportModule,
    ConfigModule,
    CryptoModule,
    TokenModule,
    NodemailerModule,
    JwtModule.register({}),
  ],
  controllers: [GoogleAuthController],
  providers: [
    GoogleAuthService,
    GoogleStrategy,
    AdministratorsService,
    AuthenticationService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    TokenService,
    OrganizationService,
  ],
})
export class GoogleAuthModule {}
