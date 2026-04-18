import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeocodingService } from './services/geocoding.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
  ],
  providers: [GeocodingService],
  exports: [GeocodingService],
})
export class CommonModule {}
