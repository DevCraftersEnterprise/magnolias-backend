import { PartialType } from "@nestjs/mapped-types";
import { BaseCreateCatalogDto } from "./base-create-catalog.dto";

export class BaseUpdateCatalogDto extends PartialType(BaseCreateCatalogDto) { }