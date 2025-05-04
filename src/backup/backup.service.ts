import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { backup_type } from '@prisma/client';
import { execSync } from 'child_process';
import { CronJob } from 'cron';
import { stat } from 'fs';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class BackupService {
  private logger = new Logger(BackupService.name);
  private baseDir = '/backup';
  constructor(
    private readonly prisma: PrismaService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async get_backup_types(jusActive = true): Promise<backup_type[]> {
    if (jusActive) return this.prisma.backup_type.findMany({ where: { active: true } });
    return this.prisma.backup_type.findMany();
  }

  //

  async create_file(name: string, type: backup_type) {
    let cmd = `sudo tar czf ${this.baseDir}/${name} `;
    const excludes = type.exclude.split(';');
    if (type.exclude != '' && excludes.length > 0)
      cmd += `--exclude=${excludes.join(' --exclude=')} `;
    cmd += `${type.dir}`;
    execSync(cmd, { stdio: 'ignore' });
  }
  async get_file_size(name: string): Promise<number> {
    return new Promise((resolve, reject) => {
      stat(`${this.baseDir}/${name}`, function (err, stats) {
        if (err) reject(err);
        resolve(stats.size);
      });
    });
  }
  async create_backup(type: backup_type) {
    const name = `${type.name.substring(0, 4)}-${Date.now()}.tar.gz`;
    try {
      await this.create_file(name, type);
    } catch (e) {
      this.logger.error(`ERROR while create backup file: ${type.name}`);
      return;
    }
    const size = await this.get_file_size(name);
    await this.prisma.backup.create({
      data: {
        file: name,
        size,
        available: true,
        typeId: type.id,
      },
    });
  }
  async delete_old_backups(type: backup_type) {
    const backups = await this.prisma.backup.findMany({
      where: { typeId: type.id, available: true },
      orderBy: { date: 'desc' },
    });
    for (let i = type.keep_count - 1; i < backups.length; i++) {
      try {
        await execSync(`sudo rm ${this.baseDir}/${backups[i].file}`, { stdio: 'ignore' });
      } catch (e) {
        this.logger.error(`ERROR while deleting backup file: ${backups[i].file}`);
        return;
      }
      await this.prisma.backup.update({
        where: { id: backups[i].id },
        data: { available: false },
      });
    }
  }

  async backup(type: backup_type) {
    await this.create_backup(type);
    await this.delete_old_backups(type);
  }

  async stop_schedule(): Promise<void> {
    const types = await this.get_backup_types();
    for (const type of types) {
      try {
        const job = this.schedulerRegistry.getCronJob(type.name);
        job.stop();
        this.schedulerRegistry.deleteCronJob(type.name);
      } catch (e) {
        this.logger.warn("Job doesn't exists");
      }
    }
  }

  async start_schedule(): Promise<void> {
    const types = await this.get_backup_types();
    for (const type of types) {
      const job = new CronJob(type.cron, () => {
        this.backup(type);
      });
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.schedulerRegistry.addCronJob(type.name, job);
      } catch (e) {
        this.logger.warn('Job already exists');
      }
      job.start();
    }
  }
}
