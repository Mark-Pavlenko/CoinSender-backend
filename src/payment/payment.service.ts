import { Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity } from '../model/payment.entity';
import { InsertResult, Repository } from 'typeorm';
import { ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import Web3 from 'web3';
import { TransfersService } from '../transfers/transfers.service';

const contract_abi = require('../../ABI/abi.json');
const contract_address = '0xA4b86a26A1C6751D9dc320416F30ff2fcbCdC946';
const web3 = new Web3('https://v1.mainnet.godwoken.io/rpc');

/* const contract_abi = require('../../ABI/abis.json');
const contract_address = '0xe517d5CCa1284EB1AF5bBa0C02B272F5a28fe491';
const web3 = new Web3('https://godwoken-testnet-v1.ckbapp.dev');  */

const colleteralToken = new web3.eth.Contract(contract_abi, contract_address);

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly repo: Repository<PaymentEntity>,
    private readonly configService: ConfigService,
    private readonly transfersService: TransfersService,
  ) {}

  @ApiOperation({ summary: 'Get all payments' })
  public async getAll(walletId: string) {
    return await this.repo.find({
      where: {
        organization_wallet_id: walletId,
      },
    });
  }

  @ApiOperation({ summary: 'Get  balance' })
  public async getBalance(id: string) {
    return await colleteralToken.methods.balanceOf(id['id']).call();
  }

  @ApiOperation({ summary: 'Mint' })
  public async mint(@Body() address: string): Promise<InsertResult> {
    const to = address['address'];
    const trans = colleteralToken.methods
      .mint(to, web3.utils.toWei('100', 'ether'))
      .encodeABI();
    const createTransaction = await web3.eth.accounts.signTransaction(
      {
        to: contract_address,
        value: 0,
        gas: '210000',
        data: trans,
        gasPrice: 10 ** 9,
      },
      this.configService.get('PRIVATE_KEY'),
    );

    const balance = await colleteralToken.methods
      .balanceOf(contract_address)
      .call();

    await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
    return balance;
  }

  @ApiOperation({ summary: 'Create payment' })
  public async create(@Body() create: PaymentEntity): Promise<InsertResult> {
    const trans = colleteralToken.methods
      .transfer(create.wallet_id, web3.utils.toWei(`${create.value}`, 'ether'))
      .encodeABI();
    const createTransaction = await web3.eth.accounts.signTransaction(
      {
        to: contract_address,
        value: 0,
        gas: '210000',
        data: trans,
        gasPrice: 10 ** 9,
      },
      create.payer_secret_id,
    );

    await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
    return this.repo.insert(create);
  }

  @ApiOperation({ summary: 'Get by organization by ID' })
  public async findById(id: number): Promise<PaymentEntity[]> {
    return await this.repo.findByIds([id]);
  }

  @ApiOperation({ summary: 'Save transaction' })
  public async saveTransaction(hash: string, transfers) {
    const getTransaction = await web3.eth.getTransaction(hash);
    const getTransactionReceipt = await web3.eth.getTransactionReceipt(hash);
    //const hashBlock = await web3.eth.getBlock(getTransaction.blockHash);
    const transactionObject = {
      status: getTransactionReceipt.status,
      organization_wallet_id: getTransactionReceipt.from,
      wallet_id: getTransactionReceipt.to,
      value: Number(web3.utils.fromWei(getTransaction.value, 'ether')),
      //timestamp_transaction: String(hashBlock.timestamp),
      hash: hash,
    };

    await this.transfersService.addHash(hash, transfers);

    return await this.repo.insert(transactionObject);
  }

  @ApiOperation({ summary: 'Find by hash id.' })
  public async findByHashId(hashId: string): Promise<PaymentEntity> {
    return await this.repo.findOne({ where: { hash: hashId } });
  }
}
