import { Module } from '@nestjs/common';
import { BreadTypesService } from './bread-types.service';
import { BreadTypesController } from './bread-types.controller';

@Module({
  controllers: [BreadTypesController],
  providers: [BreadTypesService],
})
export class BreadTypesModule {}
