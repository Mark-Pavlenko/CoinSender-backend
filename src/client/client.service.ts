import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiOperation } from '@nestjs/swagger';
import { ClientEntity } from '../model/client.entity';
import { deleteFileName } from '../helpers/fileManager';
import { checkEthWalletForValidity } from '../helpers';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientEntity: Repository<ClientEntity>,
  ) {}

  @ApiOperation({ summary: 'Get all clients' })
  public async getFullClientsList(): Promise<ClientEntity[]> {
    return await this.clientEntity.find();
  }

  public async getAllClientsByOrganization(
    organization_id: string,
  ): Promise<ClientEntity[]> {
    return await this.clientEntity.find({
      where: { organization_id: organization_id },
    });
  }

  @ApiOperation({ summary: 'Create client' })
  public async addClient(
    organization_id: string,
    avatar,
    client: ClientEntity,
  ) {
    const existingClient = await this.clientEntity.findOne({
      where: [
        {
          email: client.email,
        },
      ],
    });

    if (existingClient) {
      throw new HttpException(
        'Client with such email or wallet is already exist.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!checkEthWalletForValidity(client.wallet) && client.wallet) {
      throw new HttpException(
        'Please, check client wallet for validity.',
        HttpStatus.FORBIDDEN,
      );
    }

    const createdClient = await this.clientEntity.insert({
      ...client,
      avatar: avatar == null || undefined ? null : avatar?.filename,
      organization_id,
      description: client.description,
    });

    return await this.clientEntity.findOne({
      where: { id: createdClient.identifiers[0].id },
    });
  }

  //send full object with id in order to update exist one
  @ApiOperation({ summary: 'Edit client' })
  public async editClient(avatar, clientData, orgId) {
    try {
      const client = await this.clientEntity.findOne({
        where: { id: clientData.id },
      });

      if (!client) {
        return new HttpException(
          'Client with this id does not exist.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        (clientData.avatar_url == 'null' && client.avatar !== null) ||
        avatar !== undefined
      ) {
        await deleteFileName(client.avatar);
      }

      let totalAvatar;

      if (avatar !== undefined) {
        totalAvatar = avatar?.filename;
      } else if (clientData.avatar_url == 'null') {
        totalAvatar = null;
      } else if (clientData.avatar_url !== 'null') {
        totalAvatar = client.avatar;
      }

      delete clientData.avatar_url;

      const updatedClient = {
        ...clientData,
        avatar: totalAvatar,
      };

      await this.clientEntity
        .createQueryBuilder()
        .update()
        .set(updatedClient)
        .where('id = :id', {
          id: clientData.id,
        })
        .andWhere('organization_id = :organization_id', {
          organization_id: orgId,
        })
        .execute();

      return await this.getClientById(updatedClient.id);
    } catch (err) {
      console.log('err', err);
      throw new HttpException(
        `${err.detail}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async removeClient(client_id: number) {
    try {
      const clientForDeleting: ClientEntity = await this.clientEntity.findOne({
        where: { id: client_id },
      });

      if (!clientForDeleting) {
        return new HttpException(
          'Client with this id does not exist.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (clientForDeleting.avatar !== null) {
        await deleteFileName(clientForDeleting.avatar);
      }

      await this.clientEntity.delete({ id: client_id });

      return {
        success: true,
        message: `The client with id ${client_id} was successfully removed from system`,
      };
    } catch (err) {
      throw new HttpException(
        `${err.detail}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getClientById(id: number): Promise<ClientEntity> {
    const client = await this.clientEntity.findOne({
      where: {
        id,
      },
    });

    if (!client) {
      throw new HttpException(
        'The client with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    return client;
  }
}
