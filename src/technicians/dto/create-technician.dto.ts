import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { SenegalRegion, TechnicianStatus } from '../../common/enums';

/**
 * DTO pour la création d'un technicien agronome
 */
export class CreateTechnicianDto {
  @ApiProperty({
    description: 'Nom complet du technicien',
    example: 'Amadou Ba',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Adresse email du technicien',
    example: 'amadou.ba@agriland.sn',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Numéro de téléphone',
    example: '+221 77 888 99 00',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({
    description: 'Numéro WhatsApp',
    example: '+221 77 888 99 00',
  })
  @IsString()
  @IsOptional()
  whatsapp?: string;

  @ApiPropertyOptional({
    description: 'URL de la photo de profil',
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Spécialisation du technicien',
    example: 'Analyse de sol et fertilisation',
  })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Régions couvertes par le technicien',
    type: [String],
    enum: SenegalRegion,
    example: [SenegalRegion.THIES, SenegalRegion.DAKAR],
  })
  @IsArray()
  @IsEnum(SenegalRegion, { each: true })
  @IsOptional()
  coverageRegions?: SenegalRegion[];

  @ApiPropertyOptional({
    description: 'Statut du technicien',
    enum: TechnicianStatus,
    default: TechnicianStatus.ACTIVE,
  })
  @IsEnum(TechnicianStatus)
  @IsOptional()
  status?: TechnicianStatus;

  @ApiPropertyOptional({
    description: 'Notes internes',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
