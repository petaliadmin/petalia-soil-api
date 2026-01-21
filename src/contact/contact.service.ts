import { Injectable, NotFoundException } from '@nestjs/common';
import { LandsService } from '../lands/lands.service';

/**
 * Service de contact entre agriculteurs et propriétaires
 */
@Injectable()
export class ContactService {
  constructor(private readonly landsService: LandsService) {}

  /**
   * Récupère les informations de contact du propriétaire d'une terre
   */
  async getOwnerContact(landId: string) {
    const land = await this.landsService.findOne(landId);

    if (!land) {
      throw new NotFoundException('Terre non trouvée');
    }

    const owner = land.owner as any;

    // Créer le lien WhatsApp
    const whatsappNumber = owner.phone.replace(/[^0-9]/g, '');
    const whatsappMessage = encodeURIComponent(
      `Bonjour, je suis intéressé(e) par votre terre: ${land.title}`,
    );
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    return {
      landId: land._id,
      landTitle: land.title,
      owner: {
        name: owner.fullName,
        email: owner.email,
        phone: owner.phone,
      },
      contactMethods: {
        phone: owner.phone,
        email: owner.email,
        whatsapp: whatsappLink,
      },
      message: `Vous pouvez contacter ${owner.fullName} pour cette terre`,
    };
  }
}
