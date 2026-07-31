import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmployeePinResponse {
  @ApiProperty({
    description:
      'Short-lived token identifying the employee that authorized the current order action',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  employeeActionToken: string;

  @ApiProperty({
    description: 'Full name of the identified employee',
    example: 'María García',
  })
  employeeName: string;
}
