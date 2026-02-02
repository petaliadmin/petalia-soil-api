import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Décorateur pour récupérer le technicien actuel depuis la requête
 * À utiliser avec TechnicianAuthGuard
 */
export const CurrentTechnician = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.technician;
  },
);
