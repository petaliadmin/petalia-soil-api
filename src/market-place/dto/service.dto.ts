import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty, IsOptional, IsString, IsArray,
  IsNumber, IsBoolean, Min, IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceRequestStatus } from '../../common/enums/marketplace.enum';

// ─── Offre de service ─────────────────────────────────────────────────────────

export class CreateServiceOfferDto {
  @ApiProperty({ example: 'Analyse complète de sol avec rapport agronomique' })
  @IsNotEmpty() @IsString()
  title: string;

  @ApiProperty({ example: 'Prestation d\'analyse NPK, pH, texture du sol avec rapport détaillé et recommandations de cultures...' })
  @IsNotEmpty() @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Analyse de sol' })
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional({ example: ['sol', 'NPK', 'analyse', 'arachide'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 35000 })
  @IsNotEmpty() @IsNumber() @Min(0)
  price: number;

  @ApiProperty({ example: 'par analyse / par parcelle' })
  @IsNotEmpty() @IsString()
  priceUnit: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isNegotiable?: boolean;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional() @IsNumber() @Min(1)
  minQuantity?: number;

  @ApiPropertyOptional({ example: ['Dakar', 'Thies'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  availableRegions?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isAvailableNationwide?: boolean;

  @ApiPropertyOptional({ example: '3 à 5 jours ouvrables' })
  @IsOptional() @IsString()
  deliveryTime?: string;
}

export class UpdateServiceOfferDto extends PartialType(CreateServiceOfferDto) {}

export class FilterServiceOffersDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  region?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsNumber()
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional() @Type(() => Number) @IsNumber()
  limit?: number;
}

// ─── Demande de service / devis ───────────────────────────────────────────────

export class CreateServiceRequestDto {
  @ApiProperty({ example: '64abc123' })
  @IsNotEmpty() @IsString()
  providerId: string;

  @ApiPropertyOptional({ example: '64def456' })
  @IsOptional() @IsString()
  serviceOfferId?: string;

  @ApiProperty({ example: 'Ibrahima Diallo' })
  @IsNotEmpty() @IsString()
  clientName: string;

  @ApiProperty({ example: '+221 77 123 45 67' })
  @IsNotEmpty() @IsString()
  clientPhone: string;

  @ApiPropertyOptional({ example: 'ibrahima@email.com' })
  @IsOptional() @IsString()
  clientEmail?: string;

  @ApiPropertyOptional({ example: 'Thiès' })
  @IsOptional() @IsString()
  clientRegion?: string;

  @ApiPropertyOptional({ example: 'Mbour' })
  @IsOptional() @IsString()
  clientCommune?: string;

  @ApiProperty({ example: 'Bonjour, j\'ai une parcelle de 3 hectares à Mbour. Je souhaite une analyse de sol complète avant la saison des pluies.' })
  @IsNotEmpty() @IsString()
  description: string;

  @ApiPropertyOptional({ example: 3.5 })
  @IsOptional() @IsNumber() @Min(0)
  surfaceHectares?: number;

  @ApiPropertyOptional({ example: 'Début juin 2025' })
  @IsOptional() @IsString()
  preferredDate?: string;

  @ApiPropertyOptional({ example: 'normal', description: 'urgent | normal | flexible' })
  @IsOptional() @IsString()
  urgency?: string;
}

export class RespondToServiceRequestDto {
  @ApiProperty({ enum: ['accepted', 'declined'], example: 'accepted' })
  @IsNotEmpty() @IsString()
  action: 'accepted' | 'declined';

  @ApiPropertyOptional({ example: 'Bonjour, je suis disponible. Je propose un devis de 40 000 FCFA pour 3 jours d\'intervention.' })
  @IsOptional() @IsString()
  response?: string;

  @ApiPropertyOptional({ example: 40000 })
  @IsOptional() @IsNumber() @Min(0)
  quotedPrice?: number;
}

export class RateServiceRequestDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNotEmpty() @IsNumber() @Min(1)
  rating: number;

  @ApiPropertyOptional({ example: 'Excellent service, très professionnel et ponctuel.' })
  @IsOptional() @IsString()
  review?: string;
}
