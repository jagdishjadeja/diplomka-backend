import { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { JwtPayload, UnauthorizedException } from '@diplomka-backend/stim-feature-auth/domain';

import { TokenService } from '../service/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger: Logger = new Logger(AuthGuard.name);

  constructor(private readonly service: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx: HttpArgumentsHost = context.switchToHttp();
    const req: Request = ctx.getRequest<Request>();

    if (req.method === 'GET') {
      return true;
    }

    try {
      const jwt = req.cookies['SESSIONID'];
      if (!jwt) {
        this.logger.verbose('JWT není přítomný');
        return true;
      }

      const payload: JwtPayload = await this.service.validateToken(jwt);
      const data: { id: number; refreshToken?: string } = await this.service.validatePayload(payload);
      if (!data) {
        this.logger.verbose('JWT obsahuje nevalidní data');
        return false;
      }

      // CSRF protection
      const csrfCookie = req.cookies['XSRF-TOKEN'];
      const csrfHeader = req.headers['x-xsrf-token'];

      if (!(csrfCookie && csrfHeader && csrfCookie === csrfHeader)) {
        this.logger.verbose('XSRF-TOKEN hlavička nesedí, nebo není přitomna');
        return false;
      }

      data.refreshToken = csrfCookie;
      req['user'] = data;
      return true;
    } catch (e) {
      this.logger.error(e);
      throw new UnauthorizedException();
    }
  }
}
