import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { User } from '@stechy1/diplomka-share';

import { LoginResponse } from '@diplomka-backend/stim-feature-auth/domain';
import { LoginCommand, LogoutCommand, RefreshJwtCommand } from '@diplomka-backend/stim-feature-auth/application';

@Injectable()
export class AuthFacade {
  constructor(private readonly commandBus: CommandBus) {}

  public async login(user: User, ipAddress: string, clientID: string): Promise<LoginResponse> {
    return this.commandBus.execute(new LoginCommand(user, ipAddress, clientID));
  }

  public async logout(userId: number, refreshToken: string, fromAll: boolean): Promise<void> {
    return this.commandBus.execute(new LogoutCommand(userId, refreshToken, fromAll));
  }

  public async refreshJWT(refreshToken: string, jwt: string, clientID: string, ipAddress: any) {
    return this.commandBus.execute(new RefreshJwtCommand(refreshToken, jwt, clientID, ipAddress));
  }
}
