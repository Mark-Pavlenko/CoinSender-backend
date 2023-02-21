import { Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationEntity } from '../model/organization.entity';
import { InsertResult, Repository } from 'typeorm';
import { ApiOperation } from '@nestjs/swagger';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly repo: Repository<OrganizationEntity>,
  ) {}

  @ApiOperation({ summary: 'Get all organizations' })
  public async getAll() {
    return await this.repo.find();
  }

  @ApiOperation({ summary: 'Create organization' })
  public async createOrganization(@Body() create): Promise<InsertResult> {
    return this.repo.insert(create);
  }

  @ApiOperation({ summary: 'Get by organization by ID' })
  public async findById(organization_id: string): Promise<OrganizationEntity> {
    return await this.repo.findOne({ where: { organization_id } });
  }

  @ApiOperation({ summary: 'Find company by org. ID' })
  public async findCompany(id: string): Promise<OrganizationEntity> {
    return this.repo.findOne({ where: { organization_id: id } });
  }

  @ApiOperation({ summary: 'Find organization and add wallet' })
  public async addWallet(orgId: string, walletId: string) {
    await this.repo.update(
      { organization_id: orgId },
      {
        wallet_id: walletId,
      },
    );
  }

  @ApiOperation({ summary: 'Get organization by ID' })
  public async findByCompanyName(company_name: string) {
    return await this.repo.findOne({
      where: { company_name: company_name },
    });
  }
}
