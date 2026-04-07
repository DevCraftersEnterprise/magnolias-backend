import { PartialType } from "@nestjs/mapped-types";
import { BaseCreateCatalogDto } from "./base-create-catalog.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsBoolean } from "class-validator";

export class BaseUpdateCatalogDto extends PartialType(BaseCreateCatalogDto) {
    @ApiProperty({
        description: 'Indicates if the catalog item is active',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'isActive must be a boolean value' })
    isActive?: boolean;
}