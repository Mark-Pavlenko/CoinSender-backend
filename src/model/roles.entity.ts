import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import Role from '../authentication/enum/role.enum';
import { BaseEntity } from './base.entity';
import { AdministratorsEntity } from './administrator.entity';

@Entity({ name: 'roles' })
export class Roles extends BaseEntity {
  @OneToMany(
    () => AdministratorsEntity,
    (AdministratorsEntity) => AdministratorsEntity.role,
    {
      cascade: ['insert', 'update'],
      eager: true,
    },
  )
  @ApiProperty({
    example: 'Admin, Developer, QA, HR',
    description: 'User role',
  })
  @Column({ type: 'varchar', length: 32, unique: true })
  role: Role;
}
