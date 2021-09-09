import {
  Cell,
  Command,
  GameState,
  Player,
  ServerCommandType
} from 'diggy-shared';
import { singleton } from 'tsyringe';
import { ClientState } from '../client-state';

@singleton()
export class Ws {
  wss: WebSocket;

  constructor(
    private readonly clientState: ClientState,
    private readonly gameState: GameState
  ) {}

  start(): void {
    this.wss = new WebSocket('ws://localhost:8080/game');
    this.wss.onmessage = (event) => {
      const cmd = JSON.parse(event.data) as Command;
      if (cmd.type === ServerCommandType.MAP) {
        this.gameState.loadMap(cmd.payload);
      }
      if (cmd.type === ServerCommandType.LOGGED_IN) {
        this.clientState.loggedIn(cmd.payload);
      }
      if (cmd.type === ServerCommandType.PLAYERS) {
        const players = cmd.payload
          .split('\n')
          .map((p) => Player.fromString(p));
        this.gameState.setPlayers(players);
      }
      if (cmd.type === ServerCommandType.CELL) {
        this.gameState.setCell(Cell.fromString(cmd.payload));
      }
    };
  }

  send<C extends Command>(command: C): void {
    this.wss.send(JSON.stringify(command));
  }
}
