import { Cell, Command, Player, ServerCommandType } from 'diggy-shared';
import { singleton } from 'tsyringe';
import { EventService } from '../event-service';

@singleton()
export class Ws {
  wss: WebSocket;

  constructor(private readonly eventService: EventService) {}

  start(): void {
    this.wss = new WebSocket('ws://localhost:8080/game');
    this.wss.onmessage = (event) => {
      const cmd = JSON.parse(event.data) as Command;
      if (cmd.type === ServerCommandType.MAP) {
        this.eventService.mapLoaded(cmd.payload);
      }
      if (cmd.type === ServerCommandType.LOGGED_IN) {
        this.eventService.loggedIn(cmd.payload);
      }
      if (cmd.type === ServerCommandType.PLAYERS) {
        this.eventService.players(
          cmd.payload.split('\n').map((p) => Player.fromString(p))
        );
      }
      if (cmd.type === ServerCommandType.CELL) {
        this.eventService.cell(Cell.fromString(cmd.payload));
      }
    };
  }

  send<C extends Command>(command: C): void {
    this.wss.send(JSON.stringify(command));
  }
}
