import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import * as passwordGenerator from 'generate-password';
import crypto from 'crypto';

@Injectable()
export class CryptoService {
  constructor(private readonly configService: ConfigService) {}
  readonly salt: number = 12;
  readonly passwordLength: number = 16;
  readonly isNumbersAllowed: boolean = true;

  async generatePasswordKey(): Promise<string> {
    return passwordGenerator.generate({
      length: this.passwordLength,
      numbers: this.isNumbersAllowed,
    });
  }

  async hash(input: string): Promise<string> {
    return await hash(input, this.salt);
  }

  async compareHash(input: string, hashToCompare: string): Promise<boolean> {
    return await compare(input, hashToCompare);
  }

  async restorePasswordTokenEncoder(restorePasswordKey: string) {
    return Buffer.from(restorePasswordKey).toString('base64');
  }

  async restorePasswordTokenDecoder(encodedRestorePasswordToken: string) {
    return Buffer.from(encodedRestorePasswordToken, 'base64').toString('ascii');
  }

  async encryptText(rawText: string) {
    return await CryptoJS.AES.encrypt(
      rawText,
      this.configService.get('SECRET_ENCODE_KEY'),
    ).toString();
  }

  async decryptText(hashedText: string) {
    return await CryptoJS.AES.decrypt(
      hashedText,
      this.configService.get('SECRET_ENCODE_KEY'),
    ).toString(CryptoJS.enc.Utf8);
  }

  async generateUniqueNonce() {
    return crypto.randomBytes(16).toString('base64');
  }
}
