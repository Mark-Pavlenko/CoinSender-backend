import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Req,
  UseGuards,
  UsePipes,
  StreamableFile,
} from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersEntity } from '../model/transfers.entity';
import { ApiOperation } from '@nestjs/swagger';
import RoleGuard from '../authentication/guards/role.guard';
import RoleEnum from '../authentication/enum/role.enum';
import RequestWithAdministrator from '../authentication/interfaces/administrator.interface';
import { ValidationPipe } from '../pipes/validation.pipe';
import { editTransferSchema } from '../types/editTransfer';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('transfers')
export class TransfersController {
  constructor(private transfersService: TransfersService) {}

  @UseGuards(RoleGuard(RoleEnum.admin))
  @Get()
  @ApiOperation({ summary: 'Get all transfers' })
  public async getAllTransfers(@Req() req: RequestWithAdministrator) {
    return await this.transfersService.getAll(req.user, false);
  }

  @UseGuards(RoleGuard(RoleEnum.admin))
  @Get('completedtransfers')
  @ApiOperation({ summary: 'Get all compleated transfers' })
  public async getAllCompletedTransfers(@Req() req: RequestWithAdministrator) {
    return await this.transfersService.getAll(req.user, true);
  }

  @UseGuards(RoleGuard(RoleEnum.admin))
  @Post('edit')
  @UsePipes(new ValidationPipe(editTransferSchema))
  @ApiOperation({ summary: 'Edit transfers' })
  public async editTransfer(
    @Body() transfer: TransfersEntity,
    @Req() req: RequestWithAdministrator,
  ) {
    return await this.transfersService.update(
      transfer,
      req.user.organization_id,
    );
  }

  @UseGuards(RoleGuard(RoleEnum.admin))
  @Delete('delete')
  @ApiOperation({ summary: 'Delete transfer' })
  public async deleteTransfer(@Body() transfer: TransfersEntity) {
    return await this.transfersService.delete(transfer);
  }

  @UseGuards(RoleGuard(RoleEnum.admin))
  @Delete('delete-multiple')
  @ApiOperation({ summary: 'Delete multiple transfer' })
  public async deleteMultipleTransfers(
    @Body() body: { transfers: Array<number> },
  ) {
    return await this.transfersService.deleteMultipleTransfers(body.transfers);
  }

  @UseGuards(RoleGuard(RoleEnum.admin))
  @Post('create')
  @ApiOperation({ summary: 'Create transfer' })
  public async createTransfer(@Req() req: RequestWithAdministrator) {
    const orgId = req.user.organization_id;
    return await this.transfersService.createFromDb(orgId);
  }

  @Get('example-download.xlsx')
  getExcelExampleFile(): StreamableFile {
    const transferUpload = createReadStream(
      join(process.cwd(), `examples`, 'xslx-example.xlsx'),
    );
    return new StreamableFile(transferUpload);
  }

  @Get('example-download.csv')
  getCSVExampleFile(): StreamableFile {
    const transferUpload = createReadStream(
      join(process.cwd(), `examples`, 'csv-example.csv'),
    );
    return new StreamableFile(transferUpload);
  }
}
