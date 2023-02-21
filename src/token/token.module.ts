import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { CryptoModule } from '../crypto/crypto.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministratorsEntity } from '../model/administrator.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    CryptoModule,
    TypeOrmModule.forFeature([AdministratorsEntity]),
    JwtModule.register({}),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
