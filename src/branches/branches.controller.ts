import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Branch } from './entities/branch.entity';
import { FilterDto } from '../common/dto/filter.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { CreateBranchDto } from './dto/create-branch.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRoles } from '../users/enums/user-role';
import { CurrentUser } from 'src/auth/decorators/curret-user.decorator';
import { User } from '../users/entities/user.entity';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { CreatePhonesDto } from './dto/create-phones.dto';
import { Phone } from './entities/phone.entity';
import { UpdatePhonesDto } from './dto/update-phones.dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  registerBranch(
    @Body() createBranchDto: CreateBranchDto,
    @CurrentUser() user: User,
  ): Promise<Branch> {
    return this.branchesService.registerBranch(createBranchDto, user);
  }

  @Post('phones/:branchId')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  addBranchPhoneNumbers(
    @Body() createPhonesDto: CreatePhonesDto,
    @CurrentUser() user: User,
    @Param('branchId', ParseUUIDPipe) branchId: string,
  ): Promise<Phone> {
    return this.branchesService.addBranchPhoneNumbers(
      createPhonesDto,
      user,
      branchId,
    );
  }

  @Get()
  findBranches(
    @Query() filterDto: FilterDto,
  ): Promise<PaginationResponse<Branch>> {
    return this.branchesService.findBranches(filterDto);
  }

  @Get('all')
  findAllBranches(): Promise<Branch[]> {
    return this.branchesService.findAllBranches();
  }

  @Get(':term')
  findBranchByTerm(@Param('term') term: string): Promise<Branch | null> {
    return this.branchesService.findBranchByTerm(term);
  }

  @Patch()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  updateBranch(
    @Body() updateBranchDto: UpdateBranchDto,
    @CurrentUser() user: User,
  ): Promise<Branch> {
    return this.branchesService.updateBranch(updateBranchDto, user);
  }

  @Patch('phones')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  updateBranchPhoneNumbers(
    @Body() updatePhonesDto: UpdatePhonesDto,
    @CurrentUser() user: User,
  ): Promise<Phone> {
    return this.branchesService.updateBranchPhoneNumbers(updatePhonesDto, user);
  }

  @Delete()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  deleteBranch(
    @Body() updateBranchDto: UpdateBranchDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.branchesService.deleteBranch(updateBranchDto, user);
  }
}
