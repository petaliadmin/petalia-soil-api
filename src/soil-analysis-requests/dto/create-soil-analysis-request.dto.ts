import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SenegalRegion } from '../../common/enums';

/**
 * DTO pour les coordonnées GPS
 */
export class CoordinatesDto {
  @ApiProperty({
    description: 'Latitude GPS',
    example: 14.6928,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude GPS',
    example: -17.4467,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

/**
 * DTO pour la création d'une demande d'analyse de sol
 */
export class CreateSoilAnalysisRequestDto {
  @ApiProperty({
    description: 'Nom complet du demandeur',
    example: 'Moussa Diop',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Adresse email du demandeur',
    example: 'moussa.diop@email.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Numéro de téléphone du demandeur',
    example: '+221 77 123 45 67',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Région du Sénégal',
    enum: SenegalRegion,
    example: SenegalRegion.THIES,
  })
  @IsEnum(SenegalRegion)
  @IsNotEmpty()
  region: SenegalRegion;

  @ApiProperty({
    description: 'Commune',
    example: 'Mbour',
  })
  @IsString()
  @IsNotEmpty()
  commune: string;

  @ApiProperty({
    description: 'Surface de la parcelle en hectares',
    example: 5.5,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  surface: number;

  @ApiPropertyOptional({
    description: 'Description de la parcelle',
    example: "Parcelle destinée à la culture de l'arachide",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Coordonnées GPS de la parcelle',
    type: CoordinatesDto,
  })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;
}
