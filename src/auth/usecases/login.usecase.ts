import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from "typeorm";

import { LoginResponse } from '@/auth/responses/login.response';
import { LoginUserDto } from "@/auth/dto/login-user.dto";

import { User } from "@/users/entities/user.entity";

import * as argon2 from 'argon2';

@Injectable()
export class LoginUseCase {
    private readonly logger = new Logger(LoginUseCase.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async execute(loginUserDto: LoginUserDto, ip: string): Promise<LoginResponse> {
        const { username, userkey } = loginUserDto;

        const loginStart = Date.now();

        this.logger.log(`Login attempt for user: ${username} from IP: ${ip}`);

        const user = await this.userRepository.findOne({ where: { username } });

        if (!user) this.throwLoginAttempt(loginStart, ip, 'User not found');
        if (!user!.isActive) this.throwLoginAttempt(loginStart, ip, 'User is not active');

        const isValidUserkey = await argon2.verify(user!.userkey, userkey);

        if (!isValidUserkey) this.throwLoginAttempt(loginStart, ip, 'User credentials are invalid');

        const loginTime = Date.now() - loginStart;

        this.logger.log(`Successful login for user: ${username} (${user!.role}) from IP: ${ip} (${loginTime}ms)`);

        const accessPayload = { id: user!.id, type: 'access' };
        const refreshPayload = { id: user!.id, type: 'refresh' };

        const refreshTokenExpiry = this.configService.get('JWT_REFRESH_EXPIRY');

        const accessToken = this.jwtService.sign(accessPayload);
        const refreshToken = this.jwtService.sign(refreshPayload, { expiresIn: refreshTokenExpiry });

        return {
            message: `Bienvenido ${user!.name} ${user!.lastname}`,
            accessToken,
            refreshToken,
        }

    }

    private throwLoginAttempt(
        loginStart: number,
        ip: string,
        exceptionMessage: string,
    ) {
        const loginTime = Date.now() - loginStart;

        this.logger.warn(`Failed login attempt - From IP: ${ip} (${loginTime}ms)`);
        throw new BadRequestException(exceptionMessage);
    }
}