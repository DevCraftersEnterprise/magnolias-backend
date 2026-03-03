import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtService.verify(token);

      const user = await this.userRepository.findOne({
        where: { id: payload.id },
        select: {
          id: true,
          username: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) throw new UnauthorizedException('User not found');

      if (!user.isActive) throw new UnauthorizedException('User not active');

      request.user = user;
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        try {
          const payload = this.jwtService.decode(token);

          if (!payload || !payload.id) {
            throw new UnauthorizedException('Invalid token structure');
          }

          const user = await this.userRepository.findOne({
            where: { id: payload.id },
            select: {
              id: true,
              username: true,
              role: true,
              isActive: true,
            },
          });

          if (!user) throw new UnauthorizedException('User not found');

          if (!user.isActive) {
            throw new UnauthorizedException('User not active');
          }

          request.user = user;
          return true;
        } catch (error) {
          throw new UnauthorizedException(`Invalid expired token: ${error}`);
        }
      }

      throw new UnauthorizedException('Invalid token');
    }
  }
}
