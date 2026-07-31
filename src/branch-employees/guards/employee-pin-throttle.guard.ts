import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface PinAttempt {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

@Injectable()
export class EmployeePinThrottleGuard implements CanActivate {
  private readonly logger = new Logger(EmployeePinThrottleGuard.name);
  private readonly failedAttempts = new Map<string, PinAttempt>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(private readonly configService: ConfigService) {
    this.maxAttempts = this.configService.get<number>(
      'THROTTLE_PIN_LIMIT',
      5,
    );

    this.windowMs = this.configService.get('THROTTLE_TTL', 60) * 1000;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;

    const attempts = this.getAttempts(ip);
    const now = Date.now();

    if (attempts && now - attempts.firstAttempt >= this.windowMs) {
      this.failedAttempts.delete(ip);
      return true;
    }

    if (attempts && attempts.count >= this.maxAttempts) {
      const remainingTime = Math.ceil(
        (this.windowMs - (now - attempts.firstAttempt)) / 1000,
      );

      this.logger.warn(
        `Employee PIN throttled for IP ${ip}. ${attempts.count} failed attempts.`,
      );

      throw new BadRequestException(
        `Too many attempts. Try again in ${remainingTime} seconds`,
      );
    }

    return true;
  }

  recordFailedAttempt(ip: string): void {
    const now = Date.now();
    const attempts = this.getAttempts(ip);

    if (!attempts) {
      this.failedAttempts.set(ip, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
    } else {
      if (now - attempts.firstAttempt > this.windowMs) {
        this.failedAttempts.set(ip, {
          count: 1,
          firstAttempt: now,
          lastAttempt: now,
        });
      } else {
        attempts.count++;
        attempts.lastAttempt = now;
      }
    }

    this.logger.warn(
      `Failed employee PIN attempt recorded for IP ${ip}. Total: ${this.getAttempts(ip)?.count}`,
    );
  }

  clearFailedAttempts(ip: string): void {
    if (this.failedAttempts.has(ip)) {
      this.failedAttempts.delete(ip);
    }
  }

  private getAttempts(ip: string): PinAttempt | undefined {
    return this.failedAttempts.get(ip);
  }
}
