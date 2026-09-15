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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiCatalogListResponse,
  ApiCatalogPaginationQueries,
} from '../common/decorators/api-catalog-pagination.decorator';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { UserRoles } from '../users/enums/user-role';
import { CreateFruitDto } from './dto/create-fruit.dto';
import { UpdateFruitDto } from './dto/update-fruit.dto';
import { Fruit } from './entities/fruit.entity';
import { FruitsService } from './fruits.service';
import { FruitsFilterDto } from './dto/fruits-filter.dto';

@ApiTags('Fruits')
@Controller('fruits')
export class FruitsController {
  constructor(private readonly fruitsService: FruitsService) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create fruit',
    description: 'Creates a new fruit in the catalog.',
  })
  @ApiCreatedResponse({ description: 'Fruit created.', type: Fruit })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  create(
    @Body() createFruitDto: CreateFruitDto,
    @CurrentUser() user: User,
  ): Promise<Fruit> {
    return this.fruitsService.create(createFruitDto, user);
  }

  @Get()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get Fruits with optional filters',
    description: 'Retrieves a list of Fruits based on provided filters.',
  })
  @ApiCatalogPaginationQueries()
  @ApiOkResponse({ description: 'Fruits list.', type: [Fruit] })
  @ApiCatalogListResponse('Fruit')
  findAll(
    @Query() filterDto: FruitsFilterDto,
  ): Promise<PaginationResponse<Fruit> | Fruit[]> {
    return this.fruitsService.findAll(filterDto);
  }

  @Get(':term')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get fruit by term',
    description: 'Retrieves a specific fruit.',
  })
  @ApiParam({ name: 'term', type: 'string' })
  @ApiOkResponse({ description: 'Fruit found.', type: Fruit })
  @ApiNotFoundResponse({ description: 'Fruit not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findOne(@Param('term') term: string): Promise<Fruit> {
    return this.fruitsService.findOne(term);
  }

  @Patch(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update fruit',
    description: 'Updates an existing fruit.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Fruit updated.', type: Fruit })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiNotFoundResponse({ description: 'Fruit not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFruitDto: UpdateFruitDto,
    @CurrentUser() user: User,
  ): Promise<Fruit> {
    return this.fruitsService.update(id, updateFruitDto, user);
  }

  @Delete(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete fruit',
    description: 'Soft deletes a fruit.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Fruit deleted.' })
  @ApiNotFoundResponse({ description: 'Fruit not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.fruitsService.remove(id, user);
  }
}
