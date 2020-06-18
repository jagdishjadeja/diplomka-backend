import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { StimFeatureExperimentsModule } from '@diplomka-backend/stim-feature-experiments';

import { REPOSITORIES } from './domain/repository';
import { QueryHandlers } from './application/queries';
import { CommandHandlers } from './application/commands';
import { EventHandlers } from './application/event';
import { SequencesController } from './infrastructure/controller/sequences-controller';
import { SequencesService } from './domain/services/sequences.service';
import { SequenceEntity } from './domain/model/entity/sequence.entity';
import { SequencesFacade } from './infrastructure/service/sequences.facade';

@Module({
  controllers: [SequencesController],
  providers: [
    SequencesService,
    SequencesFacade,

    ...REPOSITORIES,
    ...QueryHandlers,
    ...CommandHandlers,
    ...EventHandlers,
  ],
  imports: [
    TypeOrmModule.forFeature([SequenceEntity]),
    CqrsModule,
    forwardRef(() => StimFeatureExperimentsModule),
  ],
  exports: [SequencesFacade],
})
export class StimFeatureSequencesModule {}
