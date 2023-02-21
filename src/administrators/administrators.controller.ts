import {
  Body,
  Req,
  Controller,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
} from '@nestjs/common';
import { AdministratorsService } from './administrators.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdministratorsEntity } from '../model/administrator.entity';
import RequestWithAdministrator from '../authentication/interfaces/administrator.interface';
import RoleGuard from '../authentication/guards/role.guard';
import JwtAuthenticationGuard from '../authentication/guards/authentication.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  editFileName,
  imageFileFilter,
  deleteFileName,
} from '../helpers/fileManager';

import RoleEnum from '../authentication/enum/role.enum';

@UseGuards(RoleGuard(RoleEnum.admin))
@Controller('administrators')
export class AdministratorsController {
  constructor(private administratorsService: AdministratorsService) {}

  @Post('avatar')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: 'Upload avatar' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/avatars',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  public async uploadedFile(
    @UploadedFile() file,
    @Req() req: RequestWithAdministrator,
  ) {
    const oldAvatar = req.user.avatar_url;
    const avatar = {
      avatar_url: file == null || undefined ? null : file?.filename,
    };

    await this.administratorsService.addAvatar(avatar, req.user.id);
    await deleteFileName(oldAvatar);

    return avatar;
  }

  @Patch('editprofile')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/avatars',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  @ApiResponse({
    status: 200,
    description: 'Data updated successful',
  })
  @ApiOperation({ summary: 'Edit profile' })
  public async edit(
    @UploadedFile() avatar,
    @Body() adminData,
    @Req() req: RequestWithAdministrator,
  ) {
    await this.administratorsService.edit(avatar, adminData, req.user.id);

    return this.administratorsService.findAdminById(req.user.id);
  }

  @Get('/admin')
  @ApiOperation({
    summary: 'Get admin by id',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin object',
    type: AdministratorsEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  public async getAdminById(@Body() body: { id: number }) {
    return this.administratorsService.findAdminById(body.id);
  }
}
