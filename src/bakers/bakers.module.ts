import { Module } from '@nestjs/common';
import { BakersService } from './bakers.service';
import { BakersController } from './bakers.controller';

@Module({
  controllers: [BakersController],
  providers: [BakersService],
})
export class BakersModule {}
