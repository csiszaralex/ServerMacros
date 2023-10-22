import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule, QueryInfo, loggingMiddleware } from 'nestjs-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { AppConfig } from './config/app.config.interface';
import { DomainModule } from './domain/domain.module';
import { SchedulerModule } from './util/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig], expandVariables: true, cache: true }),
    PrismaModule.forRootAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => ({
        prismaOptions: {
          log: ['warn', 'error'],
          errorFormat:
            configService.get<string>('node_env') === 'development' ? 'pretty' : 'minimal',
        },
        prismaServiceOptions: {
          explicitConnect: true,
          middlewares: [
            loggingMiddleware({
              logger: new Logger('Prisma'),
              logLevel: 'log',
              logMessage(query: QueryInfo) {
                return `${query.model}.${query.action}(${query.executionTime}ms)`;
              },
            }),
          ],
        },
      }),
    }),
    ScheduleModule.forRoot(),
    DomainModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
