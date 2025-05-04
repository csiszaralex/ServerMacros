import { Controller, Get } from '@nestjs/common';
import { BackupService } from './backup.service';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get()
  test() {
    return this.backupService.start_schedule();
  }
  @Get('/s')
  stop() {
    return this.backupService.stop_schedule();
  }
}
