import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/app.config.interface';
import { DomainController } from './domain.controller';
import { DomainService } from './domain.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<AppConfig>) => ({
        headers: {
          'X-Auth-Email': configService.get<string>('cloudflare.email'),
          'X-Auth-Key': configService.get<string>('cloudflare.api_key'),
        },
      }),
    }),
  ],
  controllers: [DomainController],
  providers: [DomainService],
  exports: [DomainService],
})
export class DomainModule {}
