import { MessageCodes, User } from '@stechy1/diplomka-share';

import { BaseError, ValidationErrors } from '@diplomka-backend/stim-lib-common';

export class UserNotValidException extends BaseError {
  public readonly errorCode = MessageCodes.CODE_ERROR;

  constructor(public readonly user: User, public readonly errors: ValidationErrors) {
    super();
  }
}
