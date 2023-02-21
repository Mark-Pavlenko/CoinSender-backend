import {
  Body,
  Req,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Patch,
  ClassSerializerInterceptor,
  UseInterceptors,
  HttpStatus,
  HttpException,
  Request,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AdministratorsService } from './../administrators/administrators.service';
import { OrganizationService } from './../organization/organization.service';
import RequestWithAdministrator from './interfaces/administrator.interface';
import LocalAuthenticationGuard from './guards/localauth.guard';
import JwtAuthenticationGuard from './guards/authentication.guard';
import JwtRefreshGuard from './guards/refresh.guard';
import RoleGuard from './guards/role.guard';
import RoleEnum from './enum/role.enum';
import { AdministratorsEntity } from '../model/administrator.entity';
import { Connection, Repository } from 'typeorm';
import { ValidationPipe } from '../pipes/validation.pipe';
import { changePasswordSchema } from '../types/changePassword';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { RestorePasswordDto } from './dto/restore-auth-pass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiOperation } from '@nestjs/swagger';
import { MetaMaskWalletAuthDto } from './dto/metaMaskWalletAuth.dto';
import { CreateOrganizationDto } from './dto/createOrganization.dto';
import { nanoid } from 'nanoid/async';

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
  constructor(
    @InjectRepository(AdministratorsEntity)
    private readonly administratorEntity: Repository<AdministratorsEntity>,
    private readonly authenticationService: AuthenticationService,
    private readonly administratorsService: AdministratorsService,
    private readonly organizationService: OrganizationService,
    private readonly connection: Connection,
  ) {}

  @Post('registration')
  async register(@Body() body: CreateOrganizationDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const existingAdmin = await this.administratorEntity.findOne({
      where: { email: body.email },
    });

    const existingOrganization =
      await this.organizationService.findByCompanyName(body.company_name);

    if (existingAdmin) {
      throw new HttpException(
        'Admin with such email is already exist.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (existingOrganization) {
      throw new HttpException(
        'Organization with such name is already exist.',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      const organization_id = await nanoid();

      await this.organizationService.createOrganization({
        organization_id,
        ...body,
      });

      const createdAdmin = await this.authenticationService.registerAdmin({
        ...body,
        organization_id,
        role: 'admin',
      });

      await queryRunner.commitTransaction();

      createdAdmin.organization_id = undefined;
      return createdAdmin;
    } catch (error) {
      console.log('err', error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async logIn(@Req() req: RequestWithAdministrator) {
    return this.authenticationService.logIn(req);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('logout')
  @HttpCode(200)
  async logOut(@Req() req: RequestWithAdministrator) {
    await this.administratorsService.removeRefreshToken(req.user.id);

    req.res.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookiesForLogOut(),
    );
    req.res.json('test');
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Req() req: RequestWithAdministrator) {
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(
        req.user.id,
        req.user.organization_id,
      );

    req.res.setHeader('Set-Cookie', accessTokenCookie);
    return req.user;
  }

  @Post('send-reset-password-letter')
  public async sendResetPasswordLetterToEmail(
    @Body() body: { corporate_email: string },
  ) {
    return this.authenticationService.sendResetPasswordLetterToEmail(
      body.corporate_email,
    );
  }

  @Patch('restore-password')
  public async restorePassword(@Body() restorePasswordDto: RestorePasswordDto) {
    return this.authenticationService.restorePassword(
      restorePasswordDto.restorePassKey,
      restorePasswordDto.password,
    );
  }

  @UseGuards(JwtAuthenticationGuard)
  @UseGuards(RoleGuard(RoleEnum.admin))
  @Patch('restore-password-profile')
  async changePasswordProfile(
    @Req() req: RequestWithAdministrator,
    @Body(new ValidationPipe(changePasswordSchema))
    changePasswordDto: ChangePasswordDto,
  ) {
    return this.authenticationService.changePasswordProfile(
      req.user,
      changePasswordDto,
    );
  }

  @Post('metamask-wallet-sign-in')
  @ApiOperation({ summary: 'metamask-wallet-sign-in' })
  public async verifySignature(
    @Req() req: RequestWithAdministrator,
    @Body() metaMaskWalletAuthDto: MetaMaskWalletAuthDto,
  ) {
    return this.authenticationService.verifySignature(
      req,
      metaMaskWalletAuthDto,
    );
  }

  @Post('validate-google-tokenId')
  validateGoogleTokenId(@Request() req, @Body() body: { tokenId: string }) {
    return this.authenticationService.validateGoogleTokenId(req, body.tokenId);
  }
}
