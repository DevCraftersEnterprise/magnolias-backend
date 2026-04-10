import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesModule } from '../branches/branches.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { User } from './entities/user.entity';
import { FindAllUsersUseCase } from './usecases/find-all-users.usecase';
import { FindOneUserUseCase } from './usecases/find-one-user.usecase';
import { RegisterUserUseCase } from './usecases/register-user.usecase';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserUseCase } from './usecases/update-user.usecase';
import { RemoveUserUseCase } from './usecases/remove-user.usecase';
import { ResetPasswordForUserUseCase } from './usecases/reset-password-for-user.usecase';

@Module({
  controllers: [UsersController],
  providers: [
    // Services
    UsersService,
    // Strategies
    JwtStrategy,
    // Use Cases
    RegisterUserUseCase,
    FindAllUsersUseCase,
    FindOneUserUseCase,
    UpdateUserUseCase,
    RemoveUserUseCase,
    ResetPasswordForUserUseCase,
  ],
  imports: [
    TypeOrmModule.forFeature([User]),
    CommonModule,
    CustomJwtModule,
    BranchesModule,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
