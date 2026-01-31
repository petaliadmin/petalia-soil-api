import { PartialType } from '@nestjs/swagger';
import { CreateTechnicianDto } from './create-technician.dto';

/**
 * DTO pour la mise à jour d'un technicien
 */
export class UpdateTechnicianDto extends PartialType(CreateTechnicianDto) {}
