import {
  Command,
  LoggedInCommand,
  MapCommand,
  Player,
  PlayersCommand,
  ServerCommandType
} from 'diggy-shared';

export class Ws {
  wss: WebSocket;
  onMapLoaded: (mapStr: string) => void;
  onLoggedIn: (login: string) => void;
  onPlayers: (players: Player[]) => void;

  start(): void {
    this.wss = new WebSocket('ws://localhost:8080/game');
    this.wss.onmessage = (event) => {
      const cmd = JSON.parse(event.data) as Command;
      if (cmd.type === ServerCommandType.MAP) {
        const mapCmd = cmd as MapCommand;
        this.onMapLoaded(mapCmd.map);
      }
      if (cmd.type === ServerCommandType.LOGGED_IN) {
        const loggedInCmd = cmd as LoggedInCommand;
        this.onLoggedIn(loggedInCmd.user);
      }
      if (cmd.type === ServerCommandType.PLAYERS) {
        const playersCmd = cmd as PlayersCommand;
        this.onPlayers(playersCmd.players);
      }
    };
  }

  send<C extends Command>(command: C): void {
    this.wss.send(JSON.stringify(command));
  }
}
