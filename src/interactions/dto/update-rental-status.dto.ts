import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { RentalStatus } from '../../common/enums';

/**
 * DTO pour mettre à jour le statut d'une demande de location
 */
export class UpdateRentalStatusDto {
  @ApiProperty({
    example: RentalStatus.ACCEPTED,
    enum: [RentalStatus.ACCEPTED, RentalStatus.REJECTED],
    description: 'Nouveau statut de la demande',
  })
  @IsNotEmpty({ message: 'Le statut est requis' })
  @IsEnum([RentalStatus.ACCEPTED, RentalStatus.REJECTED], {
    message: 'Le statut doit être ACCEPTED ou REJECTED',
  })
  status: RentalStatus;

  @ApiPropertyOptional({
    example: 'Votre demande a été acceptée, contactez-moi pour finaliser',
    description: 'Réponse optionnelle du propriétaire',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'La réponse ne doit pas dépasser 1000 caractères' })
  ownerResponse?: string;
}
