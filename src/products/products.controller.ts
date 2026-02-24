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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/curret-user.decorator';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { UserRoles } from '../users/enums/user-role';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsFilterDto } from './dto/products-filter.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Products
  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Creates a new product with the provided details.',
  })
  @ApiOkResponse({
    description: 'Product successfully created.',
    type: Product,
  })
  @ApiBadRequestResponse({ description: 'Invalid product data provided.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: User,
  ): Promise<Product> {
    return this.productsService.createProduct(createProductDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Get products with optional filters',
    description: 'Retrieves a list of products based on provided filters.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items to return',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of items to skip',
    example: 0,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter products by name',
  })
  @ApiQuery({
    name: 'description',
    required: false,
    type: String,
    description: 'Filter products by description',
  })
  @ApiOkResponse({
    description: 'List of all active products retrieved successfully.',
    type: [Product],
  })
  @ApiOkResponse({
    description: 'List of products retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Product' },
        },
        total: { type: 'number', example: 100 },
        pagination: {
          type: 'object',
          properties: {
            limit: { type: 'number', example: 10 },
            offset: { type: 'number', example: 0 },
            totalPages: { type: 'number', example: 10 },
            currentPage: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  findProducts(
    @Query() filterDto: ProductsFilterDto,
  ): Promise<PaginationResponse<Product> | Product[]> {
    return this.productsService.findProducts(filterDto);
  }

  @Get('favorite')
  @ApiOperation({
    summary: 'Get favorite product',
    description: 'Retrieves the favorite product.',
  })
  @ApiOkResponse({
    description: 'Favorite product retrieved successfully.',
    type: Product,
  })
  findFavoriteProduct(): Promise<Product | null> {
    return this.productsService.findFavoriteProduct();
  }

  @Get(':term')
  @ApiOperation({
    summary: 'Get product by term',
    description: 'Retrieves a product by its unique identifier or name.',
  })
  @ApiParam({
    name: 'term',
    description: 'UUID or name of the product to retrieve',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Product retrieved successfully.',
    type: Product,
  })
  @ApiNotFoundResponse({
    description: 'Product not found with the provided term.',
  })
  @ApiOkResponse({
    description: 'Product retrieved successfully.',
    type: Product,
  })
  @ApiNotFoundResponse({
    description: 'Product not found with the provided term.',
  })
  findProductByTerm(@Param('term') term: string): Promise<Product> {
    return this.productsService.findProductByTerm(term);
  }

  @Patch()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update product details',
    description: 'Updates the details of an existing product.',
  })
  @ApiOkResponse({
    description: 'Product successfully updated.',
    type: Product,
  })
  @ApiBadRequestResponse({ description: 'Invalid product data provided.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  updateProduct(
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
  ): Promise<Product> {
    return this.productsService.updateProduct(updateProductDto, user);
  }

  @Patch('favorite')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update product favorite status',
    description: 'Updates the favorite status of an existing product.',
  })
  @ApiOkResponse({
    description: 'Product successfully updated.',
    type: Product,
  })
  @ApiBadRequestResponse({ description: 'Invalid product data provided.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  updateProductFavoriteStatus(
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
  ): Promise<Product> {
    return this.productsService.updateProductFavoriteStatus(
      updateProductDto,
      user,
    );
  }

  @Delete()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete a product',
    description: 'Marks a product as inactive.',
  })
  @ApiNoContentResponse({ description: 'Product successfully deleted.' })
  @ApiBadRequestResponse({ description: 'Invalid product data provided.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({
    description: 'Product not found or already inactive.',
  })
  deleteProduct(
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.productsService.deleteProduct(updateProductDto, user);
  }

  // Product Pictures
  @Post('picture')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.ASSISTANT])
  @UseInterceptors(FilesInterceptor('files'))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload product pictures',
    description: 'Uploads one or more pictures for a product to Cloudinary.',
  })
  @ApiOkResponse({
    description: 'Pictures successfully uploaded.',
    type: Product,
  })
  @ApiBadRequestResponse({ description: 'Invalid file or product data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  uploadProductPicture(
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.uploadProductPicture(
      files,
      updateProductDto,
      user,
    );
  }

  @Delete('picture/:id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.ASSISTANT])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Hide product picture',
    description: 'Marks a product picture as inactive (soft delete).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the picture to hide',
    type: 'string',
    format: 'uuid',
  })
  @ApiNoContentResponse({ description: 'Picture successfully hidden.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Picture not found or already hidden.' })
  hideProductPicture(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.productsService.hideProductPicture(id, user);
  }
}
