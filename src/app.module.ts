import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { PrismaModule, loggingMiddleware, QueryInfo } from 'nestjs-prisma';
import { AppConfig } from './config/app.config.interface';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
