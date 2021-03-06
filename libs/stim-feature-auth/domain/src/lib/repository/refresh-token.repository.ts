import { Injectable } from '@nestjs/common';
import { EntityManager, FindConditions, Repository } from 'typeorm';

import { RefreshTokenEntity } from '../model/entity/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  private readonly _repository: Repository<RefreshTokenEntity>;

  constructor(_manager: EntityManager) {
    this._repository = _manager.getRepository(RefreshTokenEntity);
  }

  async one(criteria: FindConditions<RefreshTokenEntity>) {
    return this._repository.findOne(criteria);
  }

  async insert(token: RefreshTokenEntity): Promise<any> {
    return this._repository.insert(token);
  }

  async delete(criteria: FindConditions<RefreshTokenEntity>) {
    return this._repository.delete(criteria);
  }
}
