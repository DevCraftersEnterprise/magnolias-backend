import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

/**
 * Documenta un `GET .../:branchId` que lista usuarios operativos
 * (bakers/drivers) de una sucursal. Evita repetir el mismo bloque de
 * Swagger para cada rol multi-sucursal agregado.
 */
export function ApiStaffByBranchResponse(roleLabel: string) {
  return applyDecorators(
    ApiOperation({
      summary: `Get ${roleLabel} by branch ID`,
      description: `Retrieves a list of ${roleLabel} based on the provided branch ID.`,
    }),
    ApiOkResponse({
      description: `List of ${roleLabel} retrieved successfully.`,
      schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
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
    ApiUnauthorizedResponse({ description: 'Unauthorized access.' }),
  );
}
