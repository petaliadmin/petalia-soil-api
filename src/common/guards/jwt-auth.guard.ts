import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard pour protéger les routes avec l'authentification JWT
 * Vérifie la validité du token JWT dans le header Authorization
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
