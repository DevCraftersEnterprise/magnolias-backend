import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from 'argon2';
import { Repository } from "typeorm";
import { Branch } from '../../branches/entities/branch.entity';
import { RegisterUserDto } from "../dto/register-user.dto";
import { User } from "../entities/user.entity";
import { UserRoles } from "../enums/user-role";
import { sanitizeUser } from "../utils/sanitized-user.util";


@Injectable()
export class RegisterUserUseCase {
    private readonly logger = new Logger(RegisterUserUseCase.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Branch)
        private readonly branchRepository: Repository<Branch>,
    ) { }

    async execute(registerUserDto: RegisterUserDto): Promise<Partial<User>> {
        const { username, role, branchId, branchIds, userkey } = registerUserDto;

        const userExist = await this.userRepository.findOne({
            where: { username }
        });

        if (userExist) {
            this.logger.warn(`Username "${username}" already exists`);
            throw new BadRequestException(`Username "${username}" already exists`);
        }

        if (role === UserRoles.BAKER && !branchIds) {
            this.logger.warn(`Users with role BAKER must be linked to at least one branch`);
            throw new BadRequestException(`Users with role BAKER must be linked to at least one branch`);
        }

        const userRolesRequiredBranch = [UserRoles.EMPLOYEE, UserRoles.ASSISTANT];

        if (userRolesRequiredBranch.includes(role) && !branchId) {
            this.logger.warn(`Users with role ${role} must be assigned to a branch`);
            throw new BadRequestException(`Users with role ${role} must be assigned to a branch`);
        }
        const hashedKey = await argon2.hash(userkey);

        const userData: Partial<User> = {
            ...registerUserDto,
            userkey: hashedKey,
        };

        if (branchId) {
            const branch = await this.branchRepository.findOne({ where: { id: branchId } });

            if (!branch) {
                this.logger.warn(`Branch with identifier "${branchId}" not found`);
                throw new BadRequestException(`Branch with identifier "${branchId}" not found`);
            }

            userData.branch = branch;
        }

        if (branchIds) {
            const branchesPromises = branchIds.map(id => this.branchRepository.findOne({ where: { id } }));
            const branches = await Promise.all(branchesPromises);

            if (branches.length === 0) {
                this.logger.warn(`No valid branches found for the provided branchIds`);
                throw new BadRequestException(`No valid branches found for the provided branchIds`);
            }

            userData.branches = branches.filter(branch => branch !== null);
        }


        const user = this.userRepository.create(userData);

        await this.userRepository.save(user);

        return sanitizeUser(user);
    }
}