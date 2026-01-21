import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../common/guards';

/**
 * Contrôleur pour la mise en relation entre agriculteurs et propriétaires
 */
@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('land/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtenir les informations de contact du propriétaire d\'une terre' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Informations de contact récupérées' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Terre non trouvée' 
  })
  getOwnerContact(@Param('id') landId: string) {
    return this.contactService.getOwnerContact(landId);
  }
}
