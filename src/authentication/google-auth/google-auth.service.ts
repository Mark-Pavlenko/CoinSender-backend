import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdministratorsService } from '../../administrators/administrators.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AdministratorsEntity } from '../../model/administrator.entity';
import { Repository } from 'typeorm';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class GoogleAuthService {
  constructor(
    @InjectRepository(AdministratorsEntity)
    private readonly administratorEntity: Repository<AdministratorsEntity>,
    private readonly administratorsService: AdministratorsService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  public async googleLogin(req) {
    if (!req.user) {
      throw new HttpException(
        'This google email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const administrator = await this.administratorEntity.findOne({
      where: { email: req.user.email, isArchived: false },
    });

    if (!administrator) {
      throw new HttpException(
        'Such administrator account does not exist or it is inactive!',
        HttpStatus.NOT_FOUND,
      );
    }

    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(
        administrator.id,
        administrator.organization_id,
      );
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authenticationService.getCookieWithJwtRefreshToken(
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
