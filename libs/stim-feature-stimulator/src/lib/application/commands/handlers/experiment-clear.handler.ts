import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus } from '@nestjs/cqrs';

import {
  StimulatorEvent,
  StimulatorStateData,
} from '@diplomka-backend/stim-feature-stimulator';

import { StimulatorService } from '../../../domain/service/stimulator.service';
import { ExperimentClearCommand } from '../impl/experiment-clear.command';
import { BaseStimulatorBlockingHandler } from './base/base-stimulator-blocking.handler';

@CommandHandler(ExperimentClearCommand)
export class ExperimentClearHandler extends BaseStimulatorBlockingHandler<
  ExperimentClearCommand
> {
  constructor(private readonly service: StimulatorService, eventBus: EventBus) {
    super(eventBus, new Logger(ExperimentClearHandler.name));
  }

  protected callServiceMethod(command: ExperimentClearCommand) {
    this.service.clearExperiment();
  }

  protected init() {
    this.logger.debug('Budu mazat paměť stimulátoru.');
  }

  protected isValid(event: StimulatorEvent) {
    return event.data.name === StimulatorStateData.name;
  }
}
