import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TechnicianStatus } from '../enums';

/**
 * Guard pour authentifier les techniciens via leur code d'accès
 * Le code d'accès doit être envoyé dans le header 'x-technician-code'
 */
@Injectable()
export class TechnicianAuthGuard implements CanActivate {
  constructor(
    @InjectModel('Technician')
    private technicianModel: Model<any>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessCode = request.headers['x-technician-code'];

    if (!accessCode) {
      throw new UnauthorizedException(
        "Code d'accès technicien requis (header: x-technician-code)",
      );
    }

    const technician = await this.technicianModel
      .findOne({ accessCode })
      .exec();

    if (!technician) {
      throw new UnauthorizedException("Code d'accès invalide");
    }

    if (technician.status !== TechnicianStatus.ACTIVE) {
      throw new UnauthorizedException(
        "Ce compte technicien n'est pas actif",
      );
    }

    // Attacher le technicien à la requête pour utilisation ultérieure
    request.technician = technician;

    return true;
  }
}
