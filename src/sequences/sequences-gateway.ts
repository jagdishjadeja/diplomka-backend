import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

import { Client, Server} from 'socket.io';


import { SERVER_SOCKET_PORT } from '../config/config';
import { ExperimentsService } from '../experiments/experiments.service';
import { SequencesService } from './sequences.service';

@WebSocketGateway(SERVER_SOCKET_PORT, { namespace: '/sequence'})
export class SequencesGateway {

  private readonly logger: Logger = new Logger(SequencesGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly _service: SequencesService,
              private readonly _experiments: ExperimentsService) {
    _service.registerMessagePublisher((topic: string, data: any) => this._messagePublisher(topic, data));
  }

  private _messagePublisher(topic: string, data: any) {
    this.server.emit(topic, data);
  }

  handleConnection(client: Client, ...args: any[]): any {
    this.logger.verbose(`Klient ${client.id} navázal spojení...`);
  }

  handleDisconnect(client: Client): any {
    this.logger.verbose(`Klient ${client.id} ukončil spojení...`);
  }

  @SubscribeMessage('all')
  handleAll(client: any, message: any) {
    this._service.findAll()
        .then(experiments => {
          client.emit('all', experiments);
        });
  }

}