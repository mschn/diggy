import { Engine, Player } from 'diggy-shared';
import { Graphics } from './graphics/graphics';
import { ClientInput } from './input/client-input';
import { Ws } from './input/ws';

export class Main {
  engine: Engine;
  graphics: Graphics;
  ws: Ws;
  input: ClientInput;
  login: string;

  public start(): void {
    this.ws = new Ws();
    this.engine = new Engine();
    this.graphics = new Graphics(this.engine);
    this.input = new ClientInput(this.engine, this.ws);

    this.ws.onMapLoaded = (mapStr) => this.onMapLoaded(mapStr);
    this.ws.onLoggedIn = (login) => this.onLoggedIn(login);
    this.ws.onPlayers = (players) => this.onPlayers(players);
    this.ws.start();
  }

  private onLoggedIn(login: string): void {
    console.log(`Logged in as ${login}`);
    this.login = login;
    this.graphics.login = login;
  }

  private onMapLoaded(mapStr: string): void {
    this.engine.loadMap(mapStr);
    this.engine.start();
    this.input.start();
    this.graphics.start();
  }

  private onPlayers(players: Player[]): void {
    this.engine.players = players;
  }
}
