import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiOperation } from '@nestjs/swagger';
import { CryptoService } from '../crypto/crypto.service';
import { GeneralWalletEntity } from '../model/general_wallet.entity';
import { checkEthWalletForValidity } from '../helpers';
import { AdministratorsEntity } from '../model/administrator.entity';

@Injectable()
export class GeneralWalletService {
  constructor(
    @InjectRepository(GeneralWalletEntity)
    private readonly generalWalletEntity: Repository<GeneralWalletEntity>,
    private readonly cryptoService: CryptoService,
  ) {}

  @ApiOperation({ summary: 'Get all general invoice wallets' })
  public async getAllGeneralWallets() {
    return await this.generalWalletEntity.find();
  }

  @ApiOperation({ summary: 'Create wallet' })
  public async addGeneralWallet(
    admin: AdministratorsEntity,
    body: GeneralWalletEntity,
  ): Promise<GeneralWalletEntity> {
    const isWalletValid = checkEthWalletForValidity(body.wallet_address);

    if (!isWalletValid) {
      throw new HttpException('Wallet is not valid.', HttpStatus.FORBIDDEN);
    }

    const existingWallet = await this.generalWalletEntity.findOne({
      where: {
        wallet_address: body.wallet_address,
      },
    });

    if (existingWallet) {
      throw new HttpException(
        'This wallet is already exists.',
        HttpStatus.FORBIDDEN,
      );
    }

    const addedGeneralWallet = await this.generalWalletEntity.insert({
      ...body,
      organization_id: admin.organization_id,
      administrator_id: admin.id,
    });

    return await this.generalWalletEntity.findOne({
      where: { id: addedGeneralWallet.identifiers[0].id },
    });
  }

  async updateGeneralWallet(body: GeneralWalletEntity) {
    try {
      const isWalletValid = checkEthWalletForValidity(body.wallet_address);

      if (!isWalletValid) {
        return new HttpException('Wallet is not valid.', HttpStatus.FORBIDDEN);
      }
      await this.generalWalletEntity.update(body.id, {
        ...body,
      });
      return await this.generalWalletEntity.findOne({
        where: { id: body.id },
      });
    } catch (err) {
      throw new HttpException(
        `${err.detail}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get by organization by ID' })
  public async findAllWalletsByOrgId(
    organization_id: string,
  ): Promise<GeneralWalletEntity[]> {
    return await this.generalWalletEntity.find({
      where: {
        organization_id,
      },
    });
  }

  public async deleteGeneralWallet(id: number) {
    await this.generalWalletEntity
      .createQueryBuilder()
      .delete()
      .where('id = :id', {
        id: id,
      })
      .execute();

    return {
      success: true,
      message: `The general wallet with id ${id} was removed.`,
    };
  }
}
