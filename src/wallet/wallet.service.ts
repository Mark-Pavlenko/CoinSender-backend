import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletEntity } from '../model/wallet.entity';
import { Repository } from 'typeorm';
import { ApiOperation } from '@nestjs/swagger';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly repo: Repository<WalletEntity>,
    private readonly cryptoService: CryptoService,
  ) {}

  @ApiOperation({ summary: 'Get all wallets' })
  public async getAll() {
    return await this.repo.find();
  }

  @ApiOperation({ summary: 'Create wallet' })
  public async bindWalletToAdmin(body) {
    const encoded_signed_message =
      await this.cryptoService.restorePasswordTokenEncoder(body.signed_message);

    const existingWallet = await this.repo.findOne({
      where: {
        wallet_id: body.wallet_id,
        administrator_id: body.administrator_id,
      },
    });

    if (existingWallet) {
      throw new HttpException(
        'You have already bind this wallet.',
        HttpStatus.FORBIDDEN,
      );
    }

    const createdWallet = await this.repo.insert({
      ...body,
      encoded_signed_message,
    });

    return await this.repo.findOne({
      where: { id: createdWallet.identifiers[0].id },
    });
  }

  @ApiOperation({ summary: 'Get by organization by ID' })
  public async findById(id: number): Promise<WalletEntity[]> {
    return await this.repo.findByIds([id]);
  }

  public async deleteWallet(id: number) {
    await this.repo
      .createQueryBuilder()
      .delete()
      .where('id = :id', {
        id: id,
      })
      .execute();

    return {
      success: true,
      message: `The wallet with id ${id} was successfully removed from system`,
    };
  }
}
