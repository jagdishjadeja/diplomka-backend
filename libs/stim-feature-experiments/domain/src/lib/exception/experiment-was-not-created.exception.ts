import { Experiment, MessageCodes } from '@stechy1/diplomka-share';

import { BaseError, QueryError } from '@diplomka-backend/stim-lib-common';

export class ExperimentWasNotCreatedException extends BaseError {
  public readonly errorCode = MessageCodes.CODE_ERROR_EXPERIMENT_WAS_NOT_CREATED;

  constructor(public readonly experiment: Experiment, public readonly error?: QueryError) {
    super();
  }
}
