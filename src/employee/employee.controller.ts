import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  HttpCode,
  Patch,
  Delete,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmployeeEntity } from '../model/employee.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import RoleGuard from '../authentication/guards/role.guard';
import RequestWithAdministrator from '../authentication/interfaces/administrator.interface';

import JwtAuthenticationGuard from '../authentication/guards/authentication.guard';
import {
  editFileName,
  imageFileFilter,
  deleteFileName,
} from '../helpers/fileManager';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoicesEntity } from '../model/invoices.entity';
import { checkEthWalletForValidity } from '../helpers';

import RoleEnum from '../authentication/enum/role.enum';

@UseGuards(RoleGuard(RoleEnum.admin), JwtAuthenticationGuard)
@Controller('employee')
export class EmployeeController {
  constructor(
    private employeeService: EmployeeService,
    @InjectRepository(EmployeeEntity)
    private readonly repoEmployee: Repository<EmployeeEntity>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  public async getAll(@Req() req: RequestWithAdministrator) {
    return this.employeeService.getAll(req.user.organization_id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/avatars',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  @ApiOperation({ summary: 'Create item' })
  public async create(
    @UploadedFile() avatar,
    @Req() req: RequestWithAdministrator,
    @Body() employee: EmployeeEntity,
  ) {
    const existingEmployee = await this.repoEmployee.findOne({
      where: {
        wallet_id: employee.wallet_id,
        organization_id: req.user.organization_id,
      },
    });

    if (existingEmployee) {
      throw new HttpException(
        'The employee with such wallet address is already exist',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!checkEthWalletForValidity(employee.wallet_id)) {
      throw new HttpException('Wallet is not valid.', HttpStatus.FORBIDDEN);
    }

    return await this.employeeService.create(
      avatar,
      employee,
      req.user.organization_id,
    );
  }

  @Post('create')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/avatars',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  public async createOnlyEmployee(
    @UploadedFile() avatar,
    @Req() req: RequestWithAdministrator,
    @Body() employee: EmployeeEntity,
  ) {
    return await this.create(avatar, req, employee);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: EmployeeEntity,
  })
  public async findOne(@Param() id: number): Promise<EmployeeEntity[]> {
    return await this.employeeService.findById(id);
  }

  @HttpCode(200)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('report', {
      storage: diskStorage({
        destination: './uploads',
      }),
    }),
  )
  public async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithAdministrator,
  ) {
    return this.employeeService.createFromFile(req.user, file);
  }

  @Patch('editprofile')
  @ApiOperation({ summary: 'Edit employee profile' })
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
    await this.employeeService.edit(
      avatar,
      employeeData,
      req.user.organization_id,
    );

    return await this.employeeService.findById(employeeData.id);
  }

  @Post('avatar')
  @UseGuards(JwtAuthenticationGuard)
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
    @Body() employee: EmployeeEntity,
  ) {
    const oldAvatar = await this.employeeService.findById(employee.id);
    const avatar = {
      avatar_url: file == null || undefined ? null : file?.filename,
    };

    await this.employeeService.addAvatar(
      avatar,
      req.user.organization_id,
      employee.id,
    );
    await deleteFileName(oldAvatar[0].avatar_url);

    return avatar;
  }

  @Post('change-archived-status')
  @ApiOperation({
    summary: 'Get invoice by id',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice object',
    type: InvoicesEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  public async changeEmployeeActivityStatus(
    @Body()
    body: {
      employee_id: number;
      isArchived: boolean;
    },
  ) {
    return this.employeeService.changeEmployeeActivityStatus(
      body.employee_id,
      body.isArchived,
    );
  }

  @ApiOperation({ summary: 'Remove employee by ID' })
  @ApiResponse({
    status: 204,
    description:
      'The employee with id "id" was successfully removed from system',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Delete()
  public async removeEmployee(@Body() reqBody: { id: number }) {
    return this.employeeService.removeEmployee(+reqBody.id);
  }
}
