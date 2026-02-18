import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString,
  IsArray, IsNumber, IsBoolean, IsUrl, MinLength, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProviderType } from '../../common/enums/provider-type.enum';

// ─── Inscription (auto-registration) ─────────────────────────────────────────

export class RegisterProviderDto {
  @ApiProperty({ example: 'Mamadou Sow', description: 'Nom complet' })
  @IsNotEmpty() @IsString()
  fullName: string;

  @ApiProperty({ example: 'mamadou.sow@email.com' })
  @IsNotEmpty() @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsNotEmpty() @IsString() @MinLength(8)
  password: string;

  @ApiProperty({ example: '+221 77 654 32 10' })
  @IsNotEmpty() @IsString()
  phone: string;

  @ApiPropertyOptional({ example: '+221 77 654 32 10' })
  @IsOptional() @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'AgroTech Sénégal' })
  @IsOptional() @IsString()
  companyName?: string;

  @ApiProperty({ enum: ProviderType, example: ProviderType.AGRONOMIST })
  @IsNotEmpty() @IsEnum(ProviderType)
  providerType: ProviderType;

  @ApiPropertyOptional({ example: 'Analyse de sol et conseil en fertilisation' })
  @IsOptional() @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: ['Analyse de sol', 'Cultures maraîchères', 'Agroforesterie'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  skills?: string[];

  @ApiProperty({
    example: ['Dakar', 'Thies'],
    description: 'Régions couvertes',
    type: [String],
  })
  @IsArray() @IsString({ each: true })
  coverageRegions: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  nationalCoverage?: boolean;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional() @IsNumber() @Min(0)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ example: 'Agronome diplômé de l\'Université de Thiès avec 5 ans d\'expérience...' })
  @IsOptional() @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'Nous proposons des analyses de sol complètes...' })
  @IsOptional() @IsString()
  description?: string;

  // Tarification
  @ApiPropertyOptional({
    example: { amount: 25000, currency: 'FCFA', unit: 'par analyse', isNegotiable: true },
  })
  @IsOptional()
  pricing?: {
    amount: number;
    currency?: string;
    unit: string;
    isNegotiable?: boolean;
  };

  @ApiPropertyOptional({ example: 'https://agrotechsn.com' })
  @IsOptional() @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  facebookUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  linkedinUrl?: string;
}

// ─── Mise à jour du profil ────────────────────────────────────────────────────

export class UpdateProviderDto extends PartialType(RegisterProviderDto) {}

// ─── Filtres pour la liste ────────────────────────────────────────────────────

export class FilterProvidersDto {
  @ApiPropertyOptional({ enum: ProviderType })
  @IsOptional() @IsEnum(ProviderType)
  providerType?: ProviderType;

  @ApiPropertyOptional({ example: 'Dakar' })
  @IsOptional() @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'analyse sol' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsNumber()
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional() @Type(() => Number) @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ example: 'rating', description: 'Tri par: rating, completedServices, createdAt' })
  @IsOptional() @IsString()
  sortBy?: string;
}

// ─── Actions admin ────────────────────────────────────────────────────────────

export class ApproveProviderDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  isFeatured?: boolean;
}

export class RejectProviderDto {
  @ApiProperty({ example: 'Documents insuffisants. Veuillez fournir votre diplôme.' })
  @IsNotEmpty() @IsString()
  reason: string;
}

// ─── Login fournisseur ────────────────────────────────────────────────────────

export class LoginProviderDto {
  @ApiProperty({ example: 'mamadou.sow@email.com' })
  @IsNotEmpty() @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty() @IsString()
  password: string;
}
