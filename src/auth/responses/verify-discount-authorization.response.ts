import { ApiProperty } from '@nestjs/swagger';

export class VerifyDiscountAuthorizationResponse {
  @ApiProperty({
    description:
      'Short-lived token authorizing the application of product discounts on the order currently being created/edited',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  discountAuthToken: string;
}
