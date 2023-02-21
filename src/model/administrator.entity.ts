import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { OrganizationEntity } from './organization.entity';
import { Roles } from './roles.entity';

@Entity({ name: 'administrators' })
export class AdministratorsEntity extends BaseEntity {
  @ApiProperty({ example: 'John', description: 'Name of the person.' })
  @Column({ type: 'varchar', length: 30, nullable: true })
  public name: string;

  @ApiProperty({ example: 'Doe', description: 'Surname of the person.' })
  @Column({ type: 'varchar', length: 30, nullable: true })
  public second_name: string;

  @ApiProperty({
    example:
      'https://media.istockphoto.com/vectors/user-avatar-profile-icon-black-vector-illustration-vector-id1209654046?k=20&m=1209654046&s=612x612&w=0&h=Atw7VdjWG8KgyST8AXXJdmBkzn0lvgqyWod9vTb2XoE=',
    description: 'Employee image url.',
  })
  @Column({ type: 'varchar', length: 600, nullable: true })
  public avatar_url: string;

  @ManyToOne(() => OrganizationEntity, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'organization_id',
  })
  @ApiProperty({ example: 123, description: 'Person organization id.' })
  @Column({ type: 'varchar' })
  public organization_id: string;

  @ApiProperty({ example: 'UserPassword', description: 'User password' })
  @Column({ type: 'varchar', length: 300 })
  @Exclude()
  public password: string;

  @ApiProperty({ example: '+399912345', description: 'User Phone' })
  @Column({ type: 'varchar', length: 32, nullable: true })
  public phone: string;

  @ApiProperty({
    example: 'testingemail@megadev.com',
    description: 'User Phone',
  })
  @Column({ type: 'varchar', unique: true })
  public email: string;

  @Column({
    nullable: true,
  })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @Exclude()
  public restorePasswordToken?: string;

  @ManyToOne(() => Roles, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'role',
    referencedColumnName: 'role',
  })
  @Column({ type: 'varchar' })
  public role: string;
}
