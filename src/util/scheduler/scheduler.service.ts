import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DomainService } from 'src/domain/domain.service';

@Injectable()
export class SchedulerService {
  constructor(private readonly domainService: DomainService) {}
  // @Interval(3000)
  // @Cron('0 * * * *')
  @Cron(CronExpression.EVERY_HOUR)
  checkIP() {
    this.domainService.change_domains_if_needed();
  }
}
