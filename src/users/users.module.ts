import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesModule } from 'src/branches/branches.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RegisterUserUseCase } from './usecases/register-user.usecase';


@Module({
  controllers: [UsersController],
  providers: [
    // Services
    UsersService,
    // Strategies
    JwtStrategy,
    // Use Cases
    RegisterUserUseCase,
  ],
  imports: [
    TypeOrmModule.forFeature([User]),
    CommonModule,
    CustomJwtModule,
    BranchesModule,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule { }
