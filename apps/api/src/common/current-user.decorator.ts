import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  phone: string;
  /** Present (as 'refresh') only on refresh tokens — never accepted by the auth guard. */
  typ?: 'refresh';
}

/** Injects the authenticated user's JWT payload into a handler parameter. */
export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
