import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { testsTimeout, passwordTextRaw } from '../constants';
import { ApiConfigService } from '../config/config.service';
import { ConfigService } from '@nestjs/config/dist/config.service';

jest.setTimeout(testsTimeout);

describe('CryptoService', () => {
  let cryptoService: CryptoService;
  let apiConfigService: ApiConfigService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService, ApiConfigService, ConfigService],
    }).compile();

    apiConfigService = module.get<ApiConfigService>(ApiConfigService);
    cryptoService = module.get<CryptoService>(CryptoService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('configService should be defined', () => {
    expect(configService).toBeDefined();
  });

  it('cryptoService should be defined', () => {
    expect(cryptoService).toBeDefined();
  });

  it('apiConfigService should be defined', () => {
    expect(apiConfigService).toBeDefined();
  });

  it('should compare the raw and hashed password and return true if values are the same', async () => {
    const hashedPassword = await cryptoService.hash(passwordTextRaw);
    expect(
      cryptoService.compareHash(passwordTextRaw, hashedPassword),
    ).toBeTruthy();
  });
});
