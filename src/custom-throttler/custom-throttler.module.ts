import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'defailt',
          ttl: Number(configService.get<number>('THROTTLER_TTL', 60)) * 1000,
          limit: Number(configService.get<number>('THROTTLER_LIMIT', 10)),
        },
        {
          name: 'login',
          ttl:
            Number(configService.get<number>('THROTTLER_LOGIN_TTL', 60)) * 1000,
          limit: Number(configService.get<number>('THROTTLER_LOGIN_LIMIT', 5)),
        },
      ],
    }),
  ],
  exports: [ThrottlerModule],
})
export class CustomThrottlerModule {}
