import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import * as isCi from 'is-ci';

import { FileBrowserService } from '../file-browser/file-browser.service';
import { SettingsModule } from '../settings/settings.module';
import { SettingsService } from '../settings/settings.service';
import { FakeSerialService } from './fake-serial.service';
import { RealSerialService } from './real-serial.service';
import { SerialService } from './serial.service';
import { SerialGateway } from './serial.gateway';
import { LowLevelController } from './low-level.controller';

@Module({
  controllers: [
    LowLevelController,
  ],
  imports: [
    MulterModule.register({
      // dest: '/tmp/private/firmware'
      dest: FileBrowserService.mergePrivatePath('firmware')
    }),
    SettingsModule
  ],
  exports: [
    SerialService
  ],
  providers: [
    {
      provide: SerialService,
      useFactory: (settings: SettingsService) => {
        return (process.env.VIRTUAL_SERIAL_SERVICE === 'true' || isCi)
          ? new FakeSerialService(settings)
          : new RealSerialService(settings);
      },
      inject: [SettingsService]
    },
    SerialGateway,
  ],
})
export class LowLevelModule {

}
