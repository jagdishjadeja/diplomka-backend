import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import {
  Experiment,
  ExperimentERP,
  ExperimentType,
} from '@stechy1/diplomka-share';

import { ExperimentsFacade } from '@diplomka-backend/stim-feature-experiments';

import { ExperimentDoNotSupportSequencesError } from '../../../domain/exception';
import { generateSequence } from '../../../domain/services/sequences-generator';
import { SequenceGenerateCommand } from '../impl/sequence-generate.command';
import { SequenceWasGeneratedEvent } from '../../event';

@CommandHandler(SequenceGenerateCommand)
export class SequenceGenerateHandler
  implements ICommandHandler<SequenceGenerateCommand, number[]> {
  constructor(
    private readonly facade: ExperimentsFacade,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: SequenceGenerateCommand): Promise<number[]> {
    // Získám instanci experimentu
    const experiment: Experiment = await this.facade.experimentByID(
      command.experimentID
    );

    // Ověřím, že se jedná o experiment, který podporuje sekvence
    if (experiment.type !== ExperimentType.ERP) {
      // Vyhodím vyjímku a dál už nebudu pokračovat
      throw new ExperimentDoNotSupportSequencesError(command.experimentID);
    }

    // Nechám vygenerovat sekvenci, kterou nakonec i vrátím
    // TODO chytře zabránit nekonečnému čekání na generování sekvence
    const sequenceData: number[] = await generateSequence(
      experiment as ExperimentERP,
      command.sequenceSize
    );
    // Zvěřejním událost, že byla vygenerována nová sekvence
    this.eventBus.publish(new SequenceWasGeneratedEvent(sequenceData));
    // Nakonec vrátím vygenerovaná data sekvence
    return sequenceData;
  }
}
