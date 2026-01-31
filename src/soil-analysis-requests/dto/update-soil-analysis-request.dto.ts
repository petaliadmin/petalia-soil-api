import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AnalysisRequestStatus } from '../../common/enums';

/**
 * DTO pour la mise à jour du statut d'une demande d'analyse de sol
 */
export class UpdateSoilAnalysisRequestDto {
  @ApiPropertyOptional({
    description: 'Nouveau statut de la demande',
    enum: AnalysisRequestStatus,
    example: AnalysisRequestStatus.PROCESSING,
  })
  @IsEnum(AnalysisRequestStatus)
  @IsOptional()
  status?: AnalysisRequestStatus;
}
