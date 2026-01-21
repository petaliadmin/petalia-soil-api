import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator pour extraire l'utilisateur courant de la requête
 * Utilisé après authentification JWT
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
