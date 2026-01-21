import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums';

export const ROLES_KEY = 'roles';

/**
 * Decorator pour définir les rôles autorisés sur une route
 * @param roles - Liste des rôles autorisés
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
