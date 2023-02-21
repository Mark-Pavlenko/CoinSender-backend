import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { InvoicesEntity } from './invoices.entity';

export enum QtyType {
  pc = 'pc',
  h = 'h',
  d = 'd',
  wk = 'wk',
  mo = 'mo',
  words = 'words',
}
@Entity({ name: 'invoices_items' })
export class InvoicesItemsEntity extends BaseEntity {
  @ApiProperty({ example: 'Coinsender', description: 'Description of item' })
  @Column({ type: 'varchar', length: 300 })
  description: string;

  @ApiProperty({ example: '1', description: 'Quantity' })
  @Column({ type: 'int' })
  qty: number;

  @ApiProperty({
    example: 'pc,h,d,wk,mo,words',
    description: 'Quantity type',
    nullable: true,
  })
  @Column({ type: 'enum', enum: QtyType, nullable: true })
  qty_type: QtyType;

  @ApiProperty({ example: 30, description: 'Price for one unit' })
  @Column({ type: 'decimal' })
  unit_price: number;

  @ApiProperty({ example: 20, description: 'Discount for item' })
  @Column({ type: 'decimal' })
  discount: number;

  @ApiProperty({ example: 25, description: 'Tax percent.' })
  @Column({ type: 'decimal' })
  tax: number;

  @ApiProperty({ example: 250, description: 'Amount' })
  @Column({ type: 'decimal' })
  amount: number;

  @ApiProperty({ example: '098234', description: 'Invoice number.' })
  @Column({ type: 'int', nullable: false })
  invoice_number: number;

  @ManyToOne(() => InvoicesEntity)
  @JoinColumn({
    name: 'invoice_number',
    referencedColumnName: 'id',
  })
  items: InvoicesEntity;
}
