import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from 'argon2';
import { Repository } from "typeorm";
import { ResetPasswordDto } from '../../auth/dto/reset-password.dto';
import { User } from "../entities/user.entity";
import { getRoleLevel } from "../utils/get-role-level.util";
import { sanitizeUser } from "../utils/sanitized-user.util";

@Injectable()
export class ResetPasswordForUserUseCase {
    private readonly logger = new Logger(ResetPasswordForUserUseCase.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async execute(resetPasswordDto: ResetPasswordDto, currentUser: User): Promise<Partial<User>> {
        const { username, newPassword } = resetPasswordDto;

        this.logger.log(`Resetting password for user with username ${username} by user: ${currentUser.id}`);

        const user = await this.userRepository.findOne({ where: { username } });

        if (!user) {
            this.logger.warn(`User with username ${username} not found for password reset`);
            throw new NotFoundException(`User with username ${username} not found`);
        }

        const currentUserLevel = getRoleLevel(currentUser.role);
        const targetUserLevel = getRoleLevel(user.role);

        if (currentUserLevel < targetUserLevel) {
            this.logger.error(`User with ID ${currentUser.id} does not have permission to reset password for user with ID ${user.id}`);
            throw new BadRequestException(
                'You do not have permission to reset the password for this user',
            );
        }

        const hashedNewPassword = await argon2.hash(newPassword);

        Object.assign(user, { userkey: hashedNewPassword, updatedBy: currentUser });

        const updatedUser = await this.userRepository.save(user);

        this.logger.log(`User with ID ${user.id} updated successfully by user ${currentUser.id}`);

        return sanitizeUser(updatedUser);
    }
}

