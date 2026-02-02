import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsEnum,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { SoilTexture, DrainageQuality } from '../../common/enums';

/**
 * DTO pour les valeurs NPK
 */
class NpkDto {
  @ApiProperty({ description: 'Azote (N) en kg/ha', example: 45 })
  @IsNumber()
  @Min(0)
  nitrogen: number;

  @ApiProperty({ description: 'Phosphore (P) en kg/ha', example: 30 })
  @IsNumber()
  @Min(0)
  phosphorus: number;

  @ApiProperty({ description: 'Potassium (K) en kg/ha', example: 40 })
  @IsNumber()
  @Min(0)
  potassium: number;
}

/**
 * DTO pour la mise à jour des données du capteur de sol
 */
export class UpdateSoilDataDto {
  @ApiProperty({
    description: 'pH du sol (0-14)',
    example: 6.5,
    minimum: 0,
    maximum: 14,
  })
  @IsNumber()
  @Min(0)
  @Max(14)
  ph: number;

  @ApiProperty({
    description: 'Valeurs NPK',
    type: NpkDto,
  })
  @ValidateNested()
  @Type(() => NpkDto)
  npk: NpkDto;

  @ApiPropertyOptional({
    description: 'Taux d\'humidité du sol (%)',
    example: 25,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  moisture?: number;

  @ApiPropertyOptional({
    description: 'Texture du sol',
    enum: SoilTexture,
  })
  @IsEnum(SoilTexture)
  @IsOptional()
  texture?: SoilTexture;

  @ApiPropertyOptional({
    description: 'Qualité du drainage',
    enum: DrainageQuality,
  })
  @IsEnum(DrainageQuality)
  @IsOptional()
  drainage?: DrainageQuality;

  @ApiPropertyOptional({
    description: 'Teneur en matière organique (%)',
    example: 3.5,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  organicMatter?: number;
}
