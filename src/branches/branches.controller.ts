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

  @Delete()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  deleteBranch(
    @Body() updateBranchDto: UpdateBranchDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.branchesService.deleteBranch(updateBranchDto, user);
  }
}
