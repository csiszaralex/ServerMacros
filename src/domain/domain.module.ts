import { Module } from '@nestjs/common';
import { CloudflareModul } from 'src/cloudflare/cloudflare.module';
import { DomainController } from './domain.controller';
import { DomainService } from './domain.service';

@Module({
  imports: [CloudflareModul],
  controllers: [DomainController],
  providers: [DomainService],
  exports: [DomainService],
})
export class DomainModule {}
