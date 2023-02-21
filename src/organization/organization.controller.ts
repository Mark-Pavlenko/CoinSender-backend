import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganizationEntity } from '../model/organization.entity';
import RequestWithAdministrator from '../authentication/interfaces/administrator.interface';
 
import RoleEnum from '../authentication/enum/role.enum';
import RoleGuard from '../authentication/guards/role.guard';

@UseGuards(RoleGuard(RoleEnum.admin))
@Controller('organization')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  public async getAll() {
    return await this.organizationService.getAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create organization' })
  public async create(@Body() employee: OrganizationEntity) {
    return await this.organizationService.createOrganization(employee);
  }

  @Post('getById')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: OrganizationEntity,
  })
  public async findOne(@Body() body): Promise<OrganizationEntity> {
    return await this.organizationService.findById(body.organization_id);
  }

  @Post('addwallet')
  @ApiOperation({ summary: 'Add walet' })
  public async addWallet(
    @Body() employee: OrganizationEntity,
    @Req() req: RequestWithAdministrator,
  ) {
    try {
      await this.organizationService.addWallet(
        req.user.organization_id,
        employee.wallet_id,
      );
      return {
        statusCode: 200,
        message: 'Wallet added',
      };
    } catch (error) {
      throw new HttpException(
        'Wallet wasnt add',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
