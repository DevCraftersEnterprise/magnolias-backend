import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBranchDto } from '../../../branches/dto/create-branch.dto';
import { Branch } from '../../../branches/entities/branch.entity';
import { GeocodingService } from '../../../common/services/geocoding.service';
import { User } from '../../../users/entities/user.entity';

@Injectable()
export class CreateBranchUseCase {
  private readonly logger = new Logger(CreateBranchUseCase.name);

  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly geocodingService: GeocodingService,
  ) { }

  async execute(createBranchDto: CreateBranchDto, user: User): Promise<Branch> {
    this.logger.log(`Creating branch by user: ${user.id}`);


    const newBranch = this.branchRepository.create({
      ...createBranchDto,
      createdBy: user,
      updatedBy: user,
    });

    const result = await this.geocodingService.geocodeAddress(createBranchDto.address);

    if (result) {
      newBranch.latitude = result.latitude;
      newBranch.longitude = result.longitude;
    }

    const branch = await this.branchRepository.save(newBranch);

    this.logger.log(`Branch created with ID: ${branch.id} by user: ${user.id}`);

    return branch;
  }
}
