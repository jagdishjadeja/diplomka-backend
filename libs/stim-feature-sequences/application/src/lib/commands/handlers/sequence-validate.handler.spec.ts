import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';

import DoneCallback = jest.DoneCallback;

import { createEmptySequence, Sequence } from '@stechy1/diplomka-share';

import { SEQUENCE_INSERT_GROUP, SequenceNotValidException } from '@diplomka-backend/stim-feature-sequences/domain';

import { eventBusProvider, MockType } from 'test-helpers/test-helpers';

import { SequencesService } from '../../services/sequences.service';
import { createSequencesServiceMock } from '../../services/sequences.service.jest';
import { SequenceValidateCommand } from '../impl/sequence-validate.command';
import { SequenceValidateHandler } from './sequence-validate.handler';

describe('SequenceValidateHandler', () => {
  let testingModule: TestingModule;
  let handler: SequenceValidateHandler;
  let service: MockType<SequencesService>;
  let eventBus: MockType<EventBus>;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        SequenceValidateHandler,
        {
          provide: SequencesService,
          useFactory: createSequencesServiceMock,
        },
        eventBusProvider,
      ],
    }).compile();

    handler = testingModule.get<SequenceValidateHandler>(SequenceValidateHandler);
    // @ts-ignore
    service = testingModule.get<MockType<SequencesService>>(SequencesService);
    // @ts-ignore
    eventBus = testingModule.get<MockType<EventBus>>(EventBus);
  });

  afterEach(() => {
    service.delete.mockClear();
    eventBus.publish.mockClear();
  });

  it('positive - should validate sequence', async () => {
    const sequence: Sequence = createEmptySequence();
    sequence.name = 'sequence';
    sequence.size = 1;
    sequence.data = [1];
    const command = new SequenceValidateCommand(sequence, [SEQUENCE_INSERT_GROUP]);

    const result = await handler.execute(command);

    expect(result).toBeTruthy();
  });

  it('negative - should throw exception when not valid', async (done: DoneCallback) => {
    const sequence: Sequence = createEmptySequence();
    const command = new SequenceValidateCommand(sequence);

    try {
      await handler.execute(command);
      done.fail('SequenceNotValidException exception was thrown');
    } catch (e) {
      if (e instanceof SequenceNotValidException) {
        done();
      } else {
        done.fail('Unknown exception was thrown');
      }
    }
  });
});
