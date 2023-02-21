import { AdministratorsService } from '../administrators/administrators.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdministratorsEntity } from '../model/administrator.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Payload from './interfaces/payloadtoken.interface';
import { nanoid } from 'nanoid/async';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { CryptoService } from '../crypto/crypto.service';
import { TokenService } from '../token/token.service';
import { NodemailerService } from './../nodemailer/nodemailer.service';
import { ethers } from 'ethers';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletEntity } from '../model/wallet.entity';
import { Repository } from 'typeorm';
import { OrganizationService } from '../organization/organization.service';
import { MetaMaskWalletAuthDto } from './dto/metaMaskWalletAuth.dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly administratorsService: AdministratorsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly tokenService: TokenService,
    private readonly nodemailerService: NodemailerService,
    @InjectRepository(WalletEntity)
    private readonly walletEntity: Repository<WalletEntity>,
    private readonly organizationService: OrganizationService,
  ) {}

  public async registerAdmin(registrationData) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      return await this.administratorsService.create({
        ...registrationData,
        password: hashedPassword,
      });
    } catch (error) {
      console.log('err', error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public getCookieWithJwtAccessToken(userId: number, orgId: string) {
    const payload: Payload = { userId, orgId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}h`,
    });
    return `Authentication=${token}; Path=/; Max-Age=${this.configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    )}`;
  }

  public getCookieWithJwtRefreshToken(userId: number, orgId: string) {
    const payload: Payload = { userId, orgId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}h`,
    });
    const cookie = `Refresh=${token}; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}`;
    return {
      cookie,
      token,
    };
  }

  public getCookiesForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.administratorsService.getByEmail(email);
      await AuthenticationService.verifyPassword(
        plainTextPassword,
        user.password,
      );
      return user;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private static async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async logIn(req) {
    const { user } = req;

    const organization = await this.organizationService.findById(
      req.user.organization_id,
    );

    const accessTokenCookie = this.getCookieWithJwtAccessToken(
      user.id,
      user.organization_id,
    );
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.getCookieWithJwtRefreshToken(user.id, user.organization_id);

    await this.administratorsService.setCurrentRefreshToken(
      refreshToken,
      user.id,
    );

    req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    return { ...user, organization };
  }

  public async changePassword(
    user: AdministratorsEntity,
    changePasswordDto: ChangePasswordDto,
  ) {
    const hashedPassword = await bcrypt.hash(changePasswordDto.password, 10);
    await this.administratorsService.updatePassword(user.id, hashedPassword);
  }

  public async sendResetPasswordLetterToEmail(corporate_email: string) {
    const admin = await this.administratorsService.getByEmail(corporate_email);

    const restorePasswordToken = this.jwtService.sign(
      { id: admin.id, email: corporate_email },
      {
        secret: this.configService.get('SECRET_ENCODE_KEY'),
        expiresIn: `${this.configService.get(
          'JWT_RESTORE_PASSWORD_TOKEN_EXPIRATION_TIME',
        )}h`,
      },
    );

    const encodedTokenKey =
      await this.cryptoService.restorePasswordTokenEncoder(
        restorePasswordToken,
      );

    console.log('restore password key', encodedTokenKey);

    await this.tokenService.saveResetPasswordToken(
      admin.id,
      restorePasswordToken,
    );

    const htmlMessageBodyObj =
      await this.nodemailerService.createMessageBodyFromTemplate(
        {
          from: 'MegaDevLLC HR',
          to: corporate_email,
          subject: 'A letter with restore password link',
        },
        {
          template: 'restorePassword',
          data: {
            token: encodedTokenKey,
          },
        },
      );

    return this.nodemailerService.sendMessageToEmail(
      htmlMessageBodyObj,
      `Success! The letter with restore password link was sent to: ${htmlMessageBodyObj.to}`,
    );
  }

  public async restorePassword(restorePassKey: string, password: string) {
    const restorePasswordToken =
      await this.cryptoService.restorePasswordTokenDecoder(restorePassKey);

    const payload = await this.tokenService.verifyToken(restorePasswordToken);

    const administrator = await this.administratorsService.getByEmail(
      payload.email,
    );

    const newHashedPass = await this.cryptoService.hash(password);
    await this.administratorsService.updatePassword(
      administrator.id,
      newHashedPass,
    );
    await this.administratorsService.removeRestorePasswordToken(
      administrator.id,
    );

    const htmlMessageBodyObj =
      await this.nodemailerService.createMessageBodyFromTemplate(
        {
          from: 'MegaDevLLC HR',
          to: administrator.email,
          subject: 'New password',
        },
        {
          template: 'confirmRestorePassword',
          data: {
            password,
          },
        },
      );

    return this.nodemailerService.sendMessageToEmail(
      htmlMessageBodyObj,
      `The password was successfully restored. The letter with new one was sent to: ${htmlMessageBodyObj.to}`,
    );
  }

  public async changePasswordProfile(
    admin: AdministratorsEntity,
    changePasswordDto: ChangePasswordDto,
  ) {
    await this.getAuthenticatedUser(
      admin.email,
      changePasswordDto.old_password,
    );

    await this.changePassword(admin, changePasswordDto);

    const htmlMessageBodyObj =
      await this.nodemailerService.createMessageBodyFromTemplate(
        {
          from: 'MegaDevLLC HR',
          to: admin.email,
          subject: 'New password',
        },
        {
          template: 'confirmRestorePassword',
          data: {
            password: changePasswordDto.password,
          },
        },
      );

    return this.nodemailerService.sendMessageToEmail(
      htmlMessageBodyObj,
      `The password was successfully restored. The actual one was sent to your corporate email`,
    );
  }

  public async verifySignature(
    req,
    metaMaskWalletAuthDto: MetaMaskWalletAuthDto,
  ) {
    try {
      const encodeMessage =
        await this.cryptoService.restorePasswordTokenEncoder(
          metaMaskWalletAuthDto.raw_signed_message,
        );

      const signWalletAddress = ethers.utils.verifyMessage(
        metaMaskWalletAuthDto.raw_signed_message,
        metaMaskWalletAuthDto.signature,
      );

      const fullWalletData = await this.walletEntity.findOne({
        where: {
          wallet_id: signWalletAddress,
          encoded_signed_message: encodeMessage,
        },
      });

      if (!fullWalletData) {
        return new HttpException(
          'Such wallet address does not exist or it is not bound to any admin.',
          HttpStatus.NOT_FOUND,
        );
      }

      const organization = await this.organizationService.findById(
        fullWalletData.organization_id,
      );

      const admin = await this.administratorsService.findAdminById(
        fullWalletData.administrator_id,
      );

      const accessTokenCookie = this.getCookieWithJwtAccessToken(
        admin.id,
        admin.organization_id,
      );
      const { cookie: refreshTokenCookie, token: refreshToken } =
        this.getCookieWithJwtRefreshToken(admin.id, admin.organization_id);

      await this.administratorsService.setCurrentRefreshToken(
        refreshToken,
        admin.id,
      );

      req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

      return { ...admin, organization };
    } catch (err) {
      console.log('err', err);
      return new HttpException(
        'Incorrect signing signature!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async validateGoogleTokenId(req, tokenId: string) {
    const client = new OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: this.configService.get('GOOGLE_CLIENT_ID'),
    });

    const response = ticket.getPayload();

    if (
      response.iss !== 'accounts.google.com' &&
      response.aud !== this.configService.get('GOOGLE_CLIENT_ID')
    ) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }

    const administrator = await this.administratorsService.getByEmail(
      response.email,
    );

    if (!administrator) {
      throw new HttpException(
        'Such administrator account does not exist or it is inactive!',
        HttpStatus.NOT_FOUND,
      );
    }

    const accessTokenCookie = this.getCookieWithJwtAccessToken(
      administrator.id,
      administrator.organization_id,
    );
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.getCookieWithJwtRefreshToken(
        administrator.id,
        administrator.organization_id,
      );

    await this.administratorsService.setCurrentRefreshToken(
      refreshToken,
      administrator.id,
    );

    req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    delete administrator.password;
    return administrator;
  }
}
