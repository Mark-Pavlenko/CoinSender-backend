import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdministratorsEntity } from '../model/administrator.entity';
import { Repository } from 'typeorm';
import { ApiOperation } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { deleteFileName } from '../helpers/fileManager';

@Injectable()
export class AdministratorsService {
  constructor(
    @InjectRepository(AdministratorsEntity)
    private readonly administratorEntity: Repository<AdministratorsEntity>,
  ) {}

  @ApiOperation({ summary: 'Get all employees' })
  public async getAll() {
    return await this.administratorEntity.find();
  }

  @ApiOperation({ summary: 'Create employee' })
  public async create(userData: AdministratorsEntity) {
    const newUser = await this.administratorEntity.create(userData);
    await this.administratorEntity.save(newUser);
    return newUser;
  }

  @ApiOperation({ summary: 'Get by ID' })
  public async findById(id: number): Promise<AdministratorsEntity[]> {
    return await this.administratorEntity.findByIds([id]);
  }

  public async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.administratorEntity.update(userId, {
      currentHashedRefreshToken,
    });
  }

  public async getByEmail(email: string) {
    const user = await this.administratorEntity.findOne({
      where: {
        email,
        isArchived: false,
      },
    });
    if (user) {
      return user;
    }
    throw new HttpException(
      'The administrator with such Google email does not exist.',
      HttpStatus.NOT_FOUND,
    );
  }

  public async getById(id: number) {
    const user = await this.administratorEntity.findOne({ where: { id } });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  public async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: number,
  ) {
    const user = await this.getById(userId);

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  public async removeRefreshToken(userId: number) {
    return this.administratorEntity.update(userId, {
      currentHashedRefreshToken: null,
    });
  }

  public async removeRestorePasswordToken(userId: number) {
    return this.administratorEntity.update(userId, {
      restorePasswordToken: null,
    });
  }

  public async updatePassword(userId: number, password) {
    return this.administratorEntity.update(userId, {
      password,
    });
  }

  public async edit(avatar, adminData, adminId: number) {
    const administrator = await this.administratorEntity.findOne({
      where: { id: adminId },
    });

    if (
      (adminData.avatar_url == 'null' && administrator.avatar_url !== null) ||
      avatar !== undefined
    ) {
      await deleteFileName(administrator.avatar_url);
    }

    let totalAvatar;

    if (avatar !== undefined) {
      totalAvatar = avatar?.filename;
    } else if (adminData.avatar_url == 'null') {
      totalAvatar = null;
    } else if (adminData.avatar_url !== 'null') {
      totalAvatar = administrator.avatar_url;
    }

    return this.administratorEntity.update(adminId, {
      name: adminData.name,
      second_name: adminData.second_name,
      phone: adminData.phone,
      avatar_url: totalAvatar,
    });
  }

  public async addAvatar(adminData, userId: number) {
    return this.administratorEntity.update(userId, adminData);
  }

  public async findAdminById(adminId: number) {
    const administrator = await this.administratorEntity.findOne({
      where: { id: adminId },
    });

    if (!administrator) {
      throw new HttpException(
        'admin with this id does not exist.',
        HttpStatus.NOT_FOUND,
      );
    }

    delete administrator.password;
    return administrator;
  }
}
