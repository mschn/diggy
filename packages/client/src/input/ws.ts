import { Cell, Command, Player, ServerCommandType } from 'diggy-shared';

export class Ws {
  wss: WebSocket;
  onMapLoaded: (mapStr: string) => void;
  onLoggedIn: (login: string) => void;
  onPlayers: (players: Player[]) => void;
  onCell: (cell: Cell) => void;

  start(): void {
    this.wss = new WebSocket('ws://localhost:8080/game');
    this.wss.onmessage = (event) => {
      const cmd = JSON.parse(event.data) as Command;
      if (cmd.type === ServerCommandType.MAP) {
        this.onMapLoaded(cmd.payload);
      }
      if (cmd.type === ServerCommandType.LOGGED_IN) {
        this.onLoggedIn(cmd.payload);
      }
      if (cmd.type === ServerCommandType.PLAYERS) {
        this.onPlayers(
          cmd.payload.split('\n').map((p) => Player.fromString(p))
        );
      }
      if (cmd.type === ServerCommandType.CELL) {
        this.onCell(Cell.fromString(cmd.payload));
      }
    };
  }

  send<C extends Command>(command: C): void {
    this.wss.send(JSON.stringify(command));
  }
}
