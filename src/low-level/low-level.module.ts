import { Module } from '@nestjs/common';
import { SerialService } from './serial.service';
import { SerialGateway } from './serial.gateway';
import { LowLevelController } from './low-level.controller';
import { MulterModule } from '@nestjs/platform-express';
import { FileBrowserService } from '../file-browser/file-browser.service';
import { SettingsModule } from '../settings/settings.module';

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
    SerialService,
    SerialGateway,
  ],
})
export class LowLevelModule {

}
