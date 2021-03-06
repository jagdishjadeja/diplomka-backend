import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';

import DoneCallback = jest.DoneCallback;

import { eventBusProvider, MockType } from 'test-helpers/test-helpers';

import { createEmptyExperiment, Experiment } from '@stechy1/diplomka-share';

import { DtoFactory } from '@diplomka-backend/stim-lib-common';
import { EXPERIMENT_INSERT_GROUP, ExperimentDTO, ExperimentNotValidException } from '@diplomka-backend/stim-feature-experiments/domain';

import { ExperimentsService } from '../../services/experiments.service';
import { createExperimentsServiceMock } from '../../services/experiments.service.jest';
import { ExperimentValidateCommand } from '../impl/experiment-validate.command';
import { ExperimentValidateHandler } from './experiment-validate.handler';

describe('ExperimentValidateHandler', () => {
  let testingModule: TestingModule;
  let handler: ExperimentValidateHandler;
  let service: MockType<ExperimentsService>;
  let dtoFactory: MockType<DtoFactory>;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        ExperimentValidateHandler,
        {
          provide: ExperimentsService,
          useFactory: createExperimentsServiceMock,
        },
        {
          provide: DtoFactory,
          useFactory: jest.fn(() => ({
            getDTO: jest.fn().mockReturnValue(ExperimentDTO),
          })),
        },
      ],
    }).compile();

    handler = testingModule.get<ExperimentValidateHandler>(ExperimentValidateHandler);
    // @ts-ignore
    service = testingModule.get<MockType<ExperimentsService>>(ExperimentsService);
    // @ts-ignore
    dtoFactory = testingModule.get<MockType<DtoFactory>>(DtoFactory);
  });

  afterEach(() => {});

  it('positive - should validate experiment', async () => {
    const experiment: Experiment = createEmptyExperiment();
    experiment.name = 'name';
    const command = new ExperimentValidateCommand(experiment, [EXPERIMENT_INSERT_GROUP]);

    const result = await handler.execute(command);

    expect(result).toBeTruthy();
  });

  it('negative - should throw exception when not valid', async (done: DoneCallback) => {
    const experiment: Experiment = createEmptyExperiment();
    const command = new ExperimentValidateCommand(experiment);

    try {
      await handler.execute(command);
      done.fail('ExperimentNotValidException exception was thrown');
    } catch (e) {
      if (e instanceof ExperimentNotValidException) {
        done();
      } else {
        done.fail('Unknown exception was thrown');
      }
    }
  });
});
