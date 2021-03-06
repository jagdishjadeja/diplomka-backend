import { Response } from 'express';

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { MessageCodes } from '@stechy1/diplomka-share';

import { ControllerException } from '@diplomka-backend/stim-lib-common';
import { UnauthorizedException } from '@diplomka-backend/stim-feature-auth/domain';

/**
 * Pomocná middleware k zachycení jakékoliv chyby, která nastane na serveru
 * Pokud bych náhodou nějakou chybu neodchytíl v kontroleru,
 * odešle se na server generická informace se zprávou, že nastala
 * neočekávaná chyba na serveru
 */
@Catch(ControllerException, HttpException, Error)
export class ErrorMiddleware implements ExceptionFilter {
  private readonly logger: Logger = new Logger(ErrorMiddleware.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const res: Response = host.switchToHttp().getResponse();
    // Pokud nemá vyjímka žádné parametry, tak nemám co odesílat
    if (Object.keys(exception).length === 0) {
      // Tak to budu ignorovat
      res.send();
      return;
    }
    // Zaloguji chybu
    this.logger.error(exception);

    if (exception instanceof UnauthorizedException) {
      this.logger.error('Neautorizovaný přístup. Mažu všechna cookie z requestu.');
      res.clearCookie('SESSIONID');
      res.clearCookie('XSRF-TOKEN');
    }
    if (exception instanceof ControllerException) {
      res.status(HttpStatus.BAD_REQUEST);
      res.json({ message: { code: exception.errorCode, params: exception.params } });
      return;
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    // Odešlu klientovi informaci, že nastala neočekávaná chyba na serveru
    res.json({ message: { code: MessageCodes.CODE_ERROR } });
  }
}
