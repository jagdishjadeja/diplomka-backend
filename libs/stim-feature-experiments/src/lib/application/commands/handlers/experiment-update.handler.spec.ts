import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import DoneCallback = jest.DoneCallback;

import { QueryFailedError } from 'typeorm';

import { createEmptyExperiment, Experiment } from '@stechy1/diplomka-share';

import { commandBusProvider, eventBusProvider, MockType } from 'test-helpers/test-helpers';

import { ExperimentsService } from '../../../domain/services/experiments.service';
import { createExperimentsServiceMock } from '../../../domain/services/experiments.service.jest';
import { ExperimentWasUpdatedEvent } from '../../event/impl/experiment-was-updated.event';
import { ExperimentIdNotFoundError } from '../../../domain/exception/experiment-id-not-found.error';
import { ExperimentNotValidException } from "../../../domain/exception/experiment-not-valid.exception";
import { ExperimentWasNotUpdatedError } from '../../../domain/exception/experiment-was-not-updated.error';
import { ExperimentUpdateCommand } from '../impl/experiment-update.command';
import { ExperimentValidateCommand } from '../impl/experiment-validate.command';
import { ExperimentUpdateHandler } from './experiment-update.handler';

describe('ExperimentUpdateHandler', () => {
  let testingModule: TestingModule;
  let handler: ExperimentUpdateHandler;
  let service: MockType<ExperimentsService>;
  let commandBus: MockType<CommandBus>;
  let eventBus: MockType<EventBus>;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        ExperimentUpdateHandler,
        {
          provide: ExperimentsService,
          useFactory: createExperimentsServiceMock,
        },
        eventBusProvider,
        commandBusProvider,
      ],
    }).compile();

    handler = testingModule.get<ExperimentUpdateHandler>(ExperimentUpdateHandler);
    // @ts-ignore
    service = testingModule.get<MockType<ExperimentsService>>(ExperimentsService);
    // @ts-ignore
    commandBus = testingModule.get<MockType<CommandBus>>(CommandBus);
    // @ts-ignore
    eventBus = testingModule.get<MockType<EventBus>>(EventBus);
  });

  afterEach(() => {
    service.update.mockClear();
    eventBus.publish.mockClear();
    commandBus.execute.mockClear();
  });

  it('positive - should update experiment', async () => {
    const experiment: Experiment = createEmptyExperiment();
    experiment.id = 1;
    const command = new ExperimentUpdateCommand(experiment);

    commandBus.execute.mockReturnValue(true);
    service.byId.mockReturnValue(experiment);

    await handler.execute(command);

    expect(commandBus.execute).toBeCalledWith(new ExperimentValidateCommand(experiment));
    expect(service.update).toBeCalledWith(experiment);
    expect(eventBus.publish).toBeCalledWith(new ExperimentWasUpdatedEvent(experiment));
  });

  it('negative - should throw exception when experiment not found', async (done: DoneCallback) => {
    const experiment: Experiment = createEmptyExperiment();
    experiment.id = 1;
    const command = new ExperimentUpdateCommand(experiment);

    commandBus.execute.mockReturnValue(true);
    service.update.mockImplementation(() => {
      throw new ExperimentIdNotFoundError(experiment.id);
    });

    try {
      await handler.execute(command);
      done.fail({ message: 'ExperimentIdNotFoundError was not thrown' });
    } catch (e) {
      if (e instanceof ExperimentIdNotFoundError) {
        expect(e.experimentID).toEqual(experiment.id);
        expect(eventBus.publish).not.toBeCalled();
        done();
      } else {
        done.fail('Unknown exception was thrown.');
      }
    }
  });

  it('negative - should throw exception when experiment is not valid', async (done: DoneCallback) => {
    const experiment: Experiment = createEmptyExperiment();
    experiment.id = 1;
    const command = new ExperimentUpdateCommand(experiment);

    commandBus.execute.mockImplementation(() => {
      throw new ExperimentNotValidException(experiment);
    });

    try {
      await handler.execute(command);
      done.fail('ExperimentNotValidException was not thrown!');
    } catch (e) {
      if (e instanceof ExperimentNotValidException) {
        expect(e.experiment).toEqual(experiment);
        expect(eventBus.publish).not.toBeCalled();
        done();
      } else {
        done.fail('Unknown exception was thrown!');
      }
    }
  });

  it('negative - should throw exception when command failed', async (done: DoneCallback) => {
    const experiment: Experiment = createEmptyExperiment();
    experiment.id = 1;
    const command = new ExperimentUpdateCommand(experiment);

    commandBus.execute.mockReturnValue(true);
    service.update.mockImplementation(() => {
      throw new QueryFailedError('command', [], null);
    });

    try {
      await handler.execute(command);
      done.fail('ExperimentResultWasNotUpdatedError was not thrown!');
    } catch (e) {
      if (e instanceof ExperimentWasNotUpdatedError) {
        expect(e.experiment).toEqual(experiment);
        expect(eventBus.publish).not.toBeCalled();
        done();
      } else {
        done.fail('Unknown exception was thrown!');
      }
    }
  });

  it('negative - should throw exception when unknown error', async (done: DoneCallback) => {
    const experiment: Experiment = createEmptyExperiment();
    experiment.id = 1;
    const command = new ExperimentUpdateCommand(experiment);

    commandBus.execute.mockReturnValue(true);
    service.update.mockImplementation(() => {
      throw new Error();
    });

    try {
      await handler.execute(command);
      done.fail('ExperimentResultWasNotUpdatedError was not thrown!');
    } catch (e) {
      if (e instanceof ExperimentWasNotUpdatedError) {
        expect(e.experiment).toEqual(experiment);
        expect(eventBus.publish).not.toBeCalled();
        done();
      } else {
        done.fail('Unknown exception was thrown!');
      }
    }
  });
});
