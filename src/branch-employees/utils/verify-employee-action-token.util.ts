import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Verifies a short-lived employee-action token (issued by
 * POST /branch-employees/verify-pin) and returns the id of the individual
 * employee that authorized the action.
 */
export function verifyEmployeeActionToken(
  jwtService: JwtService,
  token?: string,
): string {
  if (!token) {
    throw new BadRequestException(
      'An employee PIN authorization is required to perform this action',
    );
  }

  let payload: any;

  try {
    payload = jwtService.verify(token);
  } catch {
    throw new BadRequestException(
      'Invalid or expired employee PIN authorization',
    );
  }

  if (payload.type !== 'employee-action') {
    throw new BadRequestException('Invalid employee PIN authorization');
  }

  return payload.employeeId;
}
