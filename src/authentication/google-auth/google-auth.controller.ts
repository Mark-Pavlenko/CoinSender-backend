import { GoogleOAuthGuard } from '../guards/google-oauth.guard';
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';

@Controller('google')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Get()
  @UseGuards(GoogleOAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth(@Request() req) {}

  @Get('redirect')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() req) {
    return this.googleAuthService.googleLogin(req);
  }
}
