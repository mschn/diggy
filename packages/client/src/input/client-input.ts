import {
  Cell,
  ClientCommandType,
  Engine,
  GameState,
  Map,
  PICKAXE_RANGE,
  Player,
  PlayerOrientation
} from 'diggy-shared';
import { singleton } from 'tsyringe';
import { ClientState } from '../client-state';
import { UI } from '../graphics/ui';
import { Ws } from './ws';

@singleton()
export class ClientInput {
  canvas: HTMLCanvasElement;
  login: string;
  players: Player[];
  map: Map;

  constructor(
    private engine: Engine,
    private ws: Ws,
    private ui: UI,
    private state: ClientState,
    private game: GameState
  ) {
    this.game.getPlayers().subscribe(players => this.players = players);
    this.game.getMap().subscribe(map => this.map = map);
    this.state.onCellClicked().subscribe((cell) => this.onCellClicked(cell));
    this.state.onCellClickStop().subscribe(() => this.onCellClickStop());
    this.state.onLoggedIn().subscribe((login) => (this.login = login));
  }

  start(): void {
    this.canvas = document.querySelector('#main canvas');
    document.addEventListener('keydown', this.onKeydown.bind(this));
    document.addEventListener('keyup', this.onKeyup.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onKeydown(e: KeyboardEvent): void {
    this.onKey(e, true);
  }

  onKeyup(e: KeyboardEvent): void {
    this.onKey(e, false);
  }

  onMouseMove(e: MouseEvent): void {
    const orientation =
      e.offsetX < this.canvas.width / 2
        ? PlayerOrientation.LEFT
        : PlayerOrientation.RIGHT;
    const player = this.engine.getPlayer(this.login);
    if (player?.orientation !== orientation) {
      this.ws.send({
        type: ClientCommandType.LOOK,
        payload: orientation.toString()
      });
    }
  }

  onCellClicked(cell: Cell): void {
    const player = this.engine.getPlayer(this.login);
    player.attacking = true;
    if (!cell.type.isWall) {
      return;
    }
    if (!this.engine.isInRange(cell, player, PICKAXE_RANGE)) {
      return;
    }

    this.ws.send({
      type: ClientCommandType.MINE,
      payload: `${cell.x},${cell.y}`
    });
  }

  onCellClickStop(): void {
    console.log('stop');
    this.engine.getPlayer(this.login).attacking = false;
  }

  onKey(e: KeyboardEvent, isKeyDown: boolean): void {
    if (e.key === 'a') {
      this.moveLeft(isKeyDown);
    }
    if (e.key === 'd') {
      this.moveRight(isKeyDown);
    }
    if ((e.key === 'w' || e.key === ' ') && isKeyDown) {
      this.jump(isKeyDown);
    }
    if (e.key === 'c' && isKeyDown) {
      this.ui.toggle();
      window.dispatchEvent(new Event('resize'));
    }
  }

  moveLeft(start: boolean): void {
    if (this.engine.getPlayer(this.login).movingLeft && start) {
      return;
    }
    this.ws.send({
      type: ClientCommandType.MOVE_LEFT,
      payload: start ? '1' : '0'
    });
  }

  moveRight(start: boolean): void {
    if (this.engine.getPlayer(this.login).movingRight && start) {
      return;
    }
    this.ws.send({
      type: ClientCommandType.MOVE_RIGHT,
      payload: start ? '1' : '0'
    });
  }

  jump(start: boolean): void {
    if (this.engine.getPlayer(this.login).airborne && start) {
      return;
    }
    this.ws.send({
      type: ClientCommandType.JUMP,
      payload: start ? '1' : '0'
    });
  }
}
