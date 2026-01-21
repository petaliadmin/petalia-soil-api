import { UserRole } from '../enums';

/**
 * Interface du payload du JWT
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
}
