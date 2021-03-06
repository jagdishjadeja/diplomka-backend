import * as functions from './lib/model/protocol/functions.protocol';

export * from './lib/stim-feature-stimulator-domain.module';

export * from './lib/exception/firmware-update-failed.exception';
export * from './lib/exception/no-uploaded-experiment.exception';
export * from './lib/exception/port-is-already-open.exception';
export * from './lib/exception/port-is-not-open.exception';
export * from './lib/exception/port-is-unable-to-close.exception';
export * from './lib/exception/port-is-unable-to-open.exception';
export * from './lib/exception/unknown-stimulator-action-type.exception';
export * from './lib/exception/unsupported-stimulator-command.exception';

export { StimulatorData } from './lib/model/stimulator-command-data';
export * from './lib/model/stimulator-command-data/stimulator-io-change.data';
export * from './lib/model/stimulator-command-data/stimulator-memory.data';
export * from './lib/model/stimulator-command-data/stimulator-next-sequence-part.data';
export * from './lib/model/stimulator-command-data/stimulator-state.data';

export * from './lib/model/stimulator-module-config';
export * from './lib/model/stimulator-action-type';

export { TOKEN_USE_VIRTUAL_SERIAL, TOKEN_USE_VIRTUAL_SERIAL_FACTORY } from './lib/tokens';

export { functions };

export * from './lib/model/serial-port';
