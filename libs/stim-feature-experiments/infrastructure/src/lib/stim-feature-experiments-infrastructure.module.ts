import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { StimFeatureExperimentsApplicationModule } from '@diplomka-backend/stim-feature-experiments/application';

import { ExperimentsFacade } from './service/experiments.facade';
import { ExperimentsController } from './controller/experiments.controller';

@Module({
  controllers: [ExperimentsController],
  imports: [CqrsModule, StimFeatureExperimentsApplicationModule],
  providers: [ExperimentsFacade],
  exports: [ExperimentsFacade],
})
export class StimFeatureExperimentsInfrastructureModule {}
