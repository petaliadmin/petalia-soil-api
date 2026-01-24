import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { LandType, LandStatus } from '../../common/enums';

/**
 * DTO pour filtrer les terres lors de la recherche
 */
export class FilterLandsDto {
  @ApiPropertyOptional({
    example: LandType.RENT,
    enum: LandType,
    description: 'Filtrer par type de transaction',
  })
  @IsOptional()
  @IsEnum(LandType)
  type?: LandType;

  @ApiPropertyOptional({
    example: LandStatus.AVAILABLE,
    enum: LandStatus,
    description: 'Filtrer par statut',
  })
  @IsOptional()
  @IsEnum(LandStatus)
  status?: LandStatus;

  @ApiPropertyOptional({
    example: 'Dakar',
    description: 'Filtrer par région',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Surface minimale en hectares',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSurface?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Surface maximale en hectares',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxSurface?: number;

  @ApiPropertyOptional({
    example: 5.5,
    description: 'pH minimal du sol',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPh?: number;

  @ApiPropertyOptional({
    example: 7.0,
    description: 'pH maximal du sol',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPh?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page pour la pagination',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: "Nombre d'éléments par page",
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
