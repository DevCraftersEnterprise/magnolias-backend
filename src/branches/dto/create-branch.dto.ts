import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Matches } from 'class-validator';

/**
 * Restringe locationUrl a dominios de Google Maps: evita que se guarde (y
 * luego se embeba en un iframe en el sitio público) un enlace arbitrario.
 */
export const GOOGLE_MAPS_URL_PATTERN =
  /^https:\/\/(www\.)?google\.[a-z.]{2,6}\/maps\/|^https:\/\/maps\.google\.[a-z.]{2,6}\/|^https:\/\/maps\.app\.goo\.gl\//i;

export class CreateBranchDto {
  @ApiProperty({
    description: 'Branch name',
    example: 'Main Branch',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Branch address',
    example: '123 Fake Street, City, Country',
  })
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({
    description:
      'Google Maps link for the branch location (share link or "insert a map" embed link). Only google.com/maps, maps.google.* or maps.app.goo.gl links are accepted.',
    example: 'https://www.google.com/maps/embed?pb=...',
  })
  @IsOptional()
  @Matches(GOOGLE_MAPS_URL_PATTERN, {
    message: 'locationUrl must be a Google Maps link',
  })
  locationUrl?: string;
}
