import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { UserRoles } from '../../users/enums/user-role';
import { User } from '../../users/entities/user.entity';
import { VerifyDiscountAuthorizationDto } from '../dto/verify-discount-authorization.dto';
import { VerifyDiscountAuthorizationResponse } from '../responses/verify-discount-authorization.response';

@Injectable()
export class VerifyDiscountAuthorizationUseCase {
  private readonly logger = new Logger(VerifyDiscountAuthorizationUseCase.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    dto: VerifyDiscountAuthorizationDto,
    ip: string,
  ): Promise<VerifyDiscountAuthorizationResponse> {
    const { username, userkey } = dto;
    const attemptStart = Date.now();

    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) this.throwFailedAttempt(attemptStart, ip, 'User not found');
    if (!user!.isActive)
      this.throwFailedAttempt(attemptStart, ip, 'User is not active');

    const isValidUserkey = await argon2.verify(user!.userkey, userkey);
    if (!isValidUserkey)
      this.throwFailedAttempt(attemptStart, ip, 'User credentials are invalid');

    if (user!.role !== UserRoles.ADMIN && user!.role !== UserRoles.SUPER)
      this.throwFailedAttempt(
        attemptStart,
        ip,
        'User is not authorized to approve discounts',
      );

    const discountAuthPayload = {
      id: user!.id,
      type: 'discount-authorization',
    };

    const discountAuthTokenExpiry = this.configService.get(
      'DISCOUNT_AUTH_TOKEN_EXPIRY',
    );

    const discountAuthToken = this.jwtService.sign(discountAuthPayload, {
      expiresIn: discountAuthTokenExpiry,
    });

    const attemptTime = Date.now() - attemptStart;
    this.logger.log(
      `Discount authorization granted by ${user!.username} (${user!.role}) (${attemptTime}ms)`,
    );

    return { discountAuthToken };
  }

  private throwFailedAttempt(
    attemptStart: number,
    ip: string,
    exceptionMessage: string,
  ) {
    const attemptTime = Date.now() - attemptStart;
    this.logger.warn(
      `Failed discount authorization attempt - From IP: ${ip} (${attemptTime}ms)`,
    );
    throw new BadRequestException(exceptionMessage);
  }
}
