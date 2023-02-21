import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdministratorsEntity } from '../model/administrator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Payload from '../authentication/interfaces/payloadtoken.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(AdministratorsEntity)
    private readonly administratorEntity: Repository<AdministratorsEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async saveResetPasswordToken(adminId: number, token: string) {
    try {
      return this.administratorEntity.update(adminId, {
        restorePasswordToken: token,
      });
    } catch (err) {
      throw new HttpException(
        `${err.detail}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getTokenByHash(decryptedToken: string) {
    const token = await this.administratorEntity.findOne({
      where: {
        restorePasswordToken: decryptedToken,
      },
    });
    if (token) {
      return token;
    }
    throw new HttpException(
      'Such restore password key does not exist or it is invalid',
      HttpStatus.NOT_FOUND,
    );
  }

  public async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('SECRET_ENCODE_KEY'),
      });
    } catch (err) {
      throw new HttpException(
        'Restore password token invalid, not exist or expired',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
