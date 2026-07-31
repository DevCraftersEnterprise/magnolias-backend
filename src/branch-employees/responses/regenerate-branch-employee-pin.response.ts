import { ApiProperty } from '@nestjs/swagger';

export class RegenerateBranchEmployeePinResponse {
  @ApiProperty({
    description:
      'The new plaintext PIN. Shown only once — it cannot be retrieved again after this response.',
    example: '4821',
  })
  pin: string;
}
