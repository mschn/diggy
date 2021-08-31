import { Cell, Engine, Player } from 'diggy-shared';
import { Graphics } from './graphics/graphics';
import { UI } from './graphics/ui';
import { ClientInput } from './input/client-input';
import { Ws } from './input/ws';

export class Main {
  engine: Engine;
  graphics: Graphics;
  ws: Ws;
  input: ClientInput;
  ui: UI;
  login: string;

  public start(): void {
    this.ws = new Ws();
    this.engine = new Engine();
    this.ui = new UI();
    this.graphics = new Graphics(this.engine, this.ui);
    this.input = new ClientInput(this.engine, this.ws, this.ui);

    this.ws.onMapLoaded = (mapStr) => this.onMapLoaded(mapStr);
    this.ws.onLoggedIn = (login) => this.onLoggedIn(login);
    this.ws.onPlayers = (players) => this.onPlayers(players);
    this.ws.onCell = (cell) => this.onCell(cell);
    this.ws.start();

    this.graphics.onCellClicked = (cell) => this.input.onCellClicked(cell);
  }

  private onLoggedIn(login: string): void {
    console.log(`Logged in as ${login}`);
    this.login = login;
    this.graphics.login = login;
    this.input.login = login;
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

  private onCell(cell: Cell): void {
    this.engine.map.cells[cell.y][cell.x] = cell;
    this.graphics.updateCell(cell);
  }
}
