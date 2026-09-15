import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiCatalogListResponse } from '../../common/decorators/api-catalog-pagination.decorator';

/**
 * Documenta un `GET .../:branchId` que lista usuarios operativos
 * (bakers/drivers) de una sucursal. Evita repetir el mismo bloque de
 * Swagger para cada rol multi-sucursal agregado; reutiliza el schema
 * items/total/pagination ya definido por ApiCatalogListResponse.
 */
export function ApiStaffByBranchResponse(roleLabel: string) {
  return applyDecorators(
    ApiOperation({
      summary: `Get ${roleLabel} by branch ID`,
      description: `Retrieves a list of ${roleLabel} based on the provided branch ID.`,
    }),
    ApiCatalogListResponse('User'),
    ApiUnauthorizedResponse({ description: 'Unauthorized access.' }),
  );
}
