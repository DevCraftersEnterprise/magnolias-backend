import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Verifies a short-lived discount authorization token (issued by
 * POST /auth/verify-discount-authorization) and returns the id of the
 * admin/super who authorized it.
 */
export function verifyDiscountAuthToken(
  jwtService: JwtService,
  token?: string,
): string {
  if (!token) {
    throw new BadRequestException(
      'A discount authorization token is required to apply a product discount',
    );
  }

  let payload: any;

  try {
    payload = jwtService.verify(token);
  } catch {
    throw new BadRequestException(
      'Invalid or expired discount authorization token',
    );
  }

  if (payload.type !== 'discount-authorization') {
    throw new BadRequestException('Invalid discount authorization token');
  }

  return payload.id;
}
