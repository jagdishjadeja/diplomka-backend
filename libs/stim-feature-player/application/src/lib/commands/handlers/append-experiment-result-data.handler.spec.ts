import { Test, TestingModule } from '@nestjs/testing';
import DoneCallback = jest.DoneCallback;

import { IOEvent } from '@stechy1/diplomka-share';

import { MockType } from 'test-helpers/test-helpers';

import { ExperimentIsNotInitializedException } from '@diplomka-backend/stim-feature-experiment-results/domain';

import { createPlayerServiceMock } from '../../service/player.service.jest';
import { PlayerService } from '../../service/player.service';
import { AppendExperimentResultDataCommand } from '../impl/append-experiment-result-data.command';
import { AppendExperimentResultDataHandler } from './append-experiment-result-data.handler';

describe('AppendExperimentResultDataHandler', () => {
  let testingModule: TestingModule;
  let handler: AppendExperimentResultDataHandler;
  let service: MockType<PlayerService>;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        AppendExperimentResultDataHandler,
        {
          provide: PlayerService,
          useFactory: createPlayerServiceMock,
        },
      ],
    }).compile();

    handler = testingModule.get<AppendExperimentResultDataHandler>(AppendExperimentResultDataHandler);
    // @ts-ignore
    service = testingModule.get<MockType<PlayerService>>(PlayerService);
  });

  afterEach(() => {
    service.pushResultData.mockClear();
  });

  it('positive - should append result data', async () => {
    const resultDataPart: IOEvent = { name: 'test', state: 'off', ioType: 'output', index: 0, timestamp: 0 };
    const command = new AppendExperimentResultDataCommand(resultDataPart);

    await handler.execute(command);

    expect(service.pushResultData).toBeCalledWith(resultDataPart);
  });

  it('negative - should throw exception when no experiment is running', async (done: DoneCallback) => {
    const resultDataPart: IOEvent = { name: 'test', state: 'off', ioType: 'output', index: 0, timestamp: 0 };
    const command = new AppendExperimentResultDataCommand(resultDataPart);

    service.pushResultData.mockImplementation(() => {
      throw new ExperimentIsNotInitializedException();
    });

    try {
      await handler.execute(command);
      done.fail('ExperimentIsNotInitializedException was not thrown!');
    } catch (e) {
      if (e instanceof ExperimentIsNotInitializedException) {
        done();
      } else {
        done.fail('Unknown exception was thrown!');
      }
    }
  });
});
