import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT optionnel - ne bloque pas si l'utilisateur n'est pas authentifié
 * Utile pour les routes publiques qui ont des fonctionnalités supplémentaires
 * pour les utilisateurs authentifiés (ex: tracking des visites)
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // Ne pas lancer d'erreur si pas d'utilisateur ou erreur de validation
    // Retourner simplement null ou l'utilisateur
    return user || null;
  }
}
