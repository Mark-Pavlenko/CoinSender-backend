import {
  Controller,
  Get,
  UseGuards,
  Req,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import RoleGuard from '../authentication/guards/role.guard';
import RoleEnum from '../authentication/enum/role.enum';
import JwtAuthenticationGuard from '../authentication/guards/authentication.guard';
import { ClientEntity } from '../model/client.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../helpers/fileManager';
import { EmployeeEntity } from '../model/employee.entity';
import RequestWithAdministrator from '../authentication/interfaces/administrator.interface';

@UseGuards(RoleGuard(RoleEnum.admin), JwtAuthenticationGuard)
@Controller('clients')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({
    status: 200,
    description: 'An array of clients entities',
    type: [ClientEntity],
  })
  public async getFullClientsList(): Promise<ClientEntity[]> {
    return await this.clientService.getFullClientsList();
  }

  @Get('organization/:organization_id')
  @ApiOperation({ summary: 'Get all clients by organization id' })
  @ApiResponse({
    status: 200,
    description: 'Get all clients by organization id',
    type: [ClientEntity],
  })
  public async getAllClientsByOrganization(
    @Param() body: { organization_id: string },
  ): Promise<ClientEntity[]> {
    return await this.clientService.getAllClientsByOrganization(
      body.organization_id,
    );
  }

  @Post('add')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/avatars',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  @ApiOperation({ summary: 'Create new client' })
  public async addClient(
    @Req() req: RequestWithAdministrator,
    @UploadedFile() avatar,
    @Body() client: ClientEntity,
  ) {
    return await this.clientService.addClient(
      req.user.organization_id,
      avatar,
      client,
    );
  }

  @Patch('edit')
  @ApiOperation({ summary: 'Edit client profile' })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/avatars',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  public async edit(
    @UploadedFile() avatar,
    @Body() employeeData: EmployeeEntity,
    @Req() req: RequestWithAdministrator,
  ) {
    return this.clientService.editClient(
      avatar,
      employeeData,
      req.user.organization_id,
    );
  }

  @ApiOperation({ summary: 'Remove client by ID' })
  @ApiResponse({
    status: 204,
    description: 'The client with id "id" was successfully removed from system',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Delete()
  public async removeClient(@Body() reqBody: { id: number }) {
    return this.clientService.removeClient(+reqBody.id);
  }

  @ApiOperation({ summary: 'Get exist client by id' })
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The found client entity',
    type: ClientEntity,
  })
  public async getClientById(
    @Param() body: { id: number },
  ): Promise<ClientEntity> {
    return await this.clientService.getClientById(body.id);
  }
}
