import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { DomainModule } from 'src/domain/domain.module';

@Module({
  imports: [DomainModule],
  controllers: [],
  providers: [SchedulerService],
})
export class SchedulerModule {}
