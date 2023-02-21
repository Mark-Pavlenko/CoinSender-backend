import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MetaMaskWalletAuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly raw_signed_message: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly signature: string;
}
