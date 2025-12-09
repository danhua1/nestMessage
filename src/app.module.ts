import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './message/messages.module';
import { AuthModule } from './authentication/auth.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';

@Module({
  imports: [
    MessagesModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env',
      ],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        timestamp: () => {
          const date = new Date();
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const seconds = date.getSeconds().toString().padStart(2, '0');
          return `,"time":"${year}-${month}-${day} ${hours}:${minutes}:${seconds}"`;
        },
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        transport: {
          targets: process.env.NODE_ENV === 'development'
            ? [
              // {
              //   level: 'debug',
              //   target: 'pino-pretty',
              //   options: {
              //     colorize: true,
              //     translateTime: false,
              //     ignore: 'pid,hostname'
              //   }
              // },
              {
                level: 'debug',
                target: 'pino-roll',
                options: {
                  file: join(__dirname, 'logs', 'log'),
                  frequency: 'daily',
                  dateFormat: 'yyyy-MM-dd',
                  mkdir: true,
                  size: '10M',
                }
              }
            ]
            : [
              {
                level: 'info',
                target: 'pino-roll',
                options: {
                  file: join(__dirname, 'logs', 'log'),
                  frequency: 'daily',
                  dateFormat: 'yyyy-MM-dd',
                  mkdir: true,
                  size: '10M',
                }
              }
            ]
        }
      }
    }),
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
