import { MessageCodes } from '@stechy1/diplomka-share';

import { BaseError } from '@diplomka-backend/stim-lib-common';

import { QueryError } from '../model/query-error';

export class ExperimentResultWasNotDeletedError extends BaseError {
  public readonly errorCode = MessageCodes.CODE_ERROR_EXPERIMENT_RESULT_WAS_NOT_DELETED;

  constructor(public readonly experimentResultID: number, public readonly error?: QueryError) {
    super();
  }
}
