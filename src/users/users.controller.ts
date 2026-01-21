import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { FilterDto } from '../common/dto/filter.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRoles } from './enums/user-role';
import { UsersService } from './users.service';

@Controller('users')
@Auth([UserRoles.SUPER, UserRoles.ADMIN])
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  registerUser(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<Partial<User>> {
    return this.usersService.registerUser(registerUserDto);
  }

  @Get()
  findUsers(
    @Query() filterDto: FilterDto,
  ): Promise<PaginationResponse<Partial<User>>> {
    return this.usersService.findUsers(filterDto);
  }

  @Get(':term')
  findUserByTerm(@Param('term') term: string): Promise<Partial<User>> {
    return this.usersService.findUserByTerm(term);
  }

  @Patch()
  updateUser(@Body() updateUserDto: UpdateUserDto): Promise<Partial<User>> {
    return this.usersService.updateUser(updateUserDto);
  }

  @Delete()
  deleteUser(@Body() updateUserDto: UpdateUserDto): Promise<void> {
    return this.usersService.deleteUser(updateUserDto);
  }
}
