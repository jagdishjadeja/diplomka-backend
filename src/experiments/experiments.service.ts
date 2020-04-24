import { Injectable, Logger } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';

import { ValidatorResult } from 'jsonschema';

import { Experiment, ExperimentType} from '@stechy1/diplomka-share';

import { CustomExperimentRepository } from '../share/custom-experiment-repository';
import { SerialService } from '../low-level/serial.service';
import { MessagePublisher } from '../share/utils';
import { EXPERIMENT_DELETE, EXPERIMENT_INSERT, EXPERIMENT_UPDATE } from './experiment.gateway.protocol';
import { ExperimentEntity } from './entity/experiment.entity';
import { ExperimentErpRepository } from './repository/experiment-erp.repository';
import { ExperimentCvepRepository } from './repository/experiment-cvep.repository';
import { ExperimentFvepRepository } from './repository/experiment-fvep.repository';
import { ExperimentTvepRepository } from './repository/experiment-tvep.repository';
import { ExperimentReaRepository } from './repository/experiment-rea.repository';
import { ExperimentRepository } from './repository/experiment.repository';

@Injectable()
export class ExperimentsService implements MessagePublisher {

  private readonly logger = new Logger(ExperimentsService.name);

  private readonly _repositoryMapping: {
    [p: string]: {
      repository: CustomExperimentRepository<any, any>,
    },
  } = {};
  private _publishMessage: (topic: string, data: any) => void;

  constructor(private readonly _serial: SerialService,
              private readonly _repository: ExperimentRepository,
              private readonly _repositoryERP: ExperimentErpRepository,
              private readonly _repositoryCVEP: ExperimentCvepRepository,
              private readonly _repositoryFVEP: ExperimentFvepRepository,
              private readonly _repositoryTVEP: ExperimentTvepRepository,
              private readonly _repositoryREA: ExperimentReaRepository) {
    this._initMapping();
  }

  private _initMapping() {
    this._repositoryMapping[ExperimentType.ERP] = {
      repository: this._repositoryERP
    };
    this._repositoryMapping[ExperimentType.CVEP] = {
      repository: this._repositoryCVEP
    };
    this._repositoryMapping[ExperimentType.FVEP] = {
      repository: this._repositoryFVEP
    };
    this._repositoryMapping[ExperimentType.TVEP] = {
      repository: this._repositoryTVEP
    };
    this._repositoryMapping[ExperimentType.REA] = {
      repository: this._repositoryREA
    };
  }

  public async findAll(options?: FindManyOptions<ExperimentEntity>): Promise<Experiment[]> {
    this.logger.log(`Hledám všechny experimenty s filtrem: '${JSON.stringify(options ? options.where : {})}'.`);
    const experiments: Experiment[] = await this._repository.all(options);
    this.logger.log(`Bylo nalezeno: ${experiments.length} záznamů.`);
    return experiments;
  }

  public async byId(id: number): Promise<Experiment> {
    this.logger.log(`Hledám experiment s id: ${id}`);
    const experiment = await this._repository.one(id);
    if (experiment === undefined) {
      return undefined;
    }
    return this._repositoryMapping[experiment.type].repository.one(experiment);
  }

  public async insert(experiment: Experiment): Promise<Experiment> {
    this.logger.log('Vkládám nový experiment do databáze.');
    experiment.usedOutputs = {led: true, audio: false, image: false};
    const result = await this._repository.insert(experiment);
    experiment.id = result.raw;
    const subresult = await this._repositoryMapping[experiment.type].repository.insert(experiment);

    const finalExperiment = await this.byId(experiment.id);
    this._publishMessage(EXPERIMENT_INSERT, finalExperiment);
    return finalExperiment;
  }

  public async update(experiment: Experiment): Promise<Experiment> {
    const originalExperiment = await this.byId(experiment.id);
    if (originalExperiment === undefined) {
      return undefined;
    }

    this.logger.log('Aktualizuji experiment.');
    experiment.usedOutputs = experiment.usedOutputs || originalExperiment.usedOutputs;
    try {
      const result = await this._repository.update(experiment);
      const subresult = await this._repositoryMapping[experiment.type].repository.update(experiment);
    } catch (e) {
      this.logger.error('Nastala neočekávaná chyba.');
      this.logger.error(e.message);
    }

    const finalExperiment = await this.byId(experiment.id);
    this._publishMessage(EXPERIMENT_UPDATE, finalExperiment);
    return finalExperiment;
  }

  public async delete(id: number): Promise<Experiment> {
    const experiment = await this.byId(id);
    if (experiment === undefined) {
      return undefined;
    }

    this.logger.log(`Mažu experiment s id: ${id}`);
    const subresult = await this._repositoryMapping[experiment.type].repository.delete(id);
    const result = await this._repository.delete(id);

    this._publishMessage(EXPERIMENT_DELETE, experiment);
    return experiment;
  }

  public async usedOutputMultimedia(id: number): Promise<{audio: {}, image: {}}> {
    const experiment: Experiment = await this.byId(id);
    if (experiment === undefined) {
      return undefined;
    }

    return this._repositoryMapping[experiment.type].repository.outputMultimedia(experiment);
  }

  public async validateExperiment(experiment: Experiment): Promise<boolean> {
    this.logger.log('Validuji experiment.');
    const result: ValidatorResult = await this._repositoryMapping[experiment.type].repository.validate(experiment);
    this.logger.log(`Je experiment validní: ${result.valid}.`);
    if (!result.valid) {
      this.logger.debug(result.errors);
    }
    return result.valid;
  }

  public async nameExists(name: string, id: number|'new'): Promise<boolean> {
    if (id === 'new') {
      this.logger.log(`Testuji, zda-li zadaný název nového experimentu již existuje: ${name}.`);
    } else {
      this.logger.log(`Testuji, zda-li zadaný název pro existující experiment již existuje: ${name}.`);
    }
    const exists = await this._repository.nameExists(name, id);
    this.logger.log(`Výsledek existence názvu: ${exists}.`);
    return exists;
  }

  public registerMessagePublisher(messagePublisher: (topic: string, data: any) => void) {
    this._publishMessage = messagePublisher;
  }

  public publishMessage(topic: string, data: any): void {
    this._publishMessage(topic, data);
  }

}
