import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import {
  Settings,
  SettingsFacade,
} from '@diplomka-backend/stim-feature-settings';

import { SaveSerialPathIfNecessaryCommand } from '../impl/save-serial-path-if-necessary.command';

@CommandHandler(SaveSerialPathIfNecessaryCommand)
export class SaveSerialPathIfNecessaryHandler
  implements ICommandHandler<SaveSerialPathIfNecessaryCommand, void> {
  private readonly logger: Logger = new Logger(
    SaveSerialPathIfNecessaryHandler.name
  );

  constructor(private readonly facade: SettingsFacade) {}

  async execute(command: SaveSerialPathIfNecessaryCommand): Promise<void> {
    this.logger.debug('Možná aktualizovat cestu k sériové lince.');
    this.logger.debug('1. Získám aktuální nastavení.');
    // Odešlu požadavek na získání nastavení
    const originalSettings: Settings = await this.facade.getSettings();
    this.logger.debug('Nastavení bylo úspěšně získáno');
    this.logger.debug('2. Z nastavení si přečtu pořebnou proměnnou.');
    const saveSerialPath = originalSettings.autoconnectToStimulator;
    this.logger.debug(`{autoconnectToStimulator=${saveSerialPath}}.`);
    this.logger.debug(
      '3. Na základě proměnné se rozhodnu, zda-li aktualizuji nastavení, či nikoliv.'
    );
    if (saveSerialPath) {
      this.logger.debug('Budu aktualizovat cestu k sériové lince.');
      const settings = { ...originalSettings };
      settings.comPortName = command.path;
      this.logger.debug('Odesílám požadavek na aktualizaci nastavení.');
      await this.facade.updateSettings(settings);
    } else {
      this.logger.debug('Nic aktualizovat nebudu.');
    }
  }
}
