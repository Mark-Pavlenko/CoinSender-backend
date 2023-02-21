import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getApplicationPort() {
    return this.getValue('APPLICATION_PORT', true);
  }

  public getRedisPort() {
    return this.getValue('REDIS_PORT', true);
  }

  public getRedisHost() {
    return this.getValue('REDIS_HOST', true);
  }

  public getPGHost() {
    return this.getValue('POSTGRES_HOST', true);
  }

  public getPGPort() {
    return parseInt(this.getValue('POSTGRES_PORT', true));
  }

  public getPGUser() {
    return this.getValue('POSTGRES_USER', true);
  }

  public getPGPassword() {
    return this.getValue('POSTGRES_PASSWORD', true);
  }

  public getPGDatabase() {
    return this.getValue('POSTGRES_DATABASE', true);
  }

  public getEnvValue() {
    return this.getValue('ENV', false);
  }

  public isProduction() {
    const mode = this.getValue('ENV', false);
    return mode != 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    const entEnv =
      this.getEnvValue() === 'PROD'
        ? ['dist/**/*.entity{.js,.js}']
        : ['**/*.entity{.ts,.js}'];

    return {
      type: 'postgres',
      host: this.getPGHost(),
      port: this.getPGPort(),
      username: this.getPGUser(),
      password: this.getPGPassword(),
      database: this.getPGDatabase(),
      entities: entEnv,
    };
  }
}

const configService = new ConfigService(process.env);

export { configService };
