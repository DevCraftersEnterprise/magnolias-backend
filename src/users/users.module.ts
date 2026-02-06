import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Baker } from '../bakers/entities/baker.entity';
import { BranchesModule } from 'src/branches/branches.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([User, Baker]),
    CommonModule,
    CustomJwtModule,
    BranchesModule,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
