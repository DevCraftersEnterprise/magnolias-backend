import { Module } from '@nestjs/common';
import { FormatsService } from './formats.service';
import { FormatsController } from './formats.controller';
import { PrinterModule } from 'src/printer/printer.module';
import { OrdersModule } from '../orders/orders.module';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';

@Module({
  controllers: [FormatsController],
  providers: [FormatsService],
  imports: [PrinterModule, OrdersModule, CommonModule, CustomJwtModule],
})
export class FormatsModule {}
