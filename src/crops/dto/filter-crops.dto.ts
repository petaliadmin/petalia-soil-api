import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterCropsDto {
  @ApiPropertyOptional({
    description: 'Catégorie de culture',
    enum: ['cereales', 'legumineuses', 'tubercules', 'maraichage', 'industrielles', 'fruits'],
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Recherche par nom' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Texture de sol', example: 'loamy' })
  @IsOptional()
  @IsString()
  texture?: string;

  @ApiPropertyOptional({ description: 'Qualité de drainage', example: 'good' })
  @IsOptional()
  @IsString()
  drainage?: string;

  @ApiPropertyOptional({ description: 'Numéro de page', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Nombre de résultats par page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}