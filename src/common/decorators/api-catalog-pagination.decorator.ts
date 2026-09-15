import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';

/**
 * Documenta los query params comunes de un `GET` de catálogo paginado
 * (limit/offset/isActive). Pensado para catálogos nuevos (evita repetir
 * los mismos 3 `@ApiQuery` en cada controlador de catálogo agregado).
 */
export function ApiCatalogPaginationQueries() {
  return applyDecorators(
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items to return',
      example: 10,
    }),
    ApiQuery({
      name: 'offset',
      required: false,
      type: Number,
      description: 'Number of items to skip',
      example: 0,
    }),
    ApiQuery({
      name: 'isActive',
      required: false,
      type: Boolean,
      description: 'Value to recover thee item if they are active or not',
      example: true,
    }),
  );
}

/**
 * Documenta la respuesta paginada de un `GET` de catálogo (items/total/
 * pagination), parametrizada por el nombre del schema de Swagger. Pensado
 * para catálogos nuevos (evita repetir el mismo bloque de schema en cada
 * controlador de catálogo agregado).
 */
export function ApiCatalogListResponse(schemaName: string) {
  return applyDecorators(
    ApiOkResponse({
      description: `List of ${schemaName}s retrieved successfully.`,
      schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: `#/components/schemas/${schemaName}` },
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
    }),
  );
}
