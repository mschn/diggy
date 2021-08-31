import {
  Cell,
  ClientCommandType,
  Engine,
  PICKAXE_RANGE,
  PlayerOrientation
} from 'diggy-shared';
import { UI } from '../graphics/ui';
import { Ws } from './ws';

export class ClientInput {
  canvas: HTMLCanvasElement;
  login: string;

  constructor(private readonly engine: Engine, private readonly ws: Ws, private readonly ui: UI) {}

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
    if (!cell.type.isWall) {
      return;
    }
    const player = this.engine.getPlayer(this.login);
    if (!this.engine.isInRange(cell, player, PICKAXE_RANGE)) {
      return;
    }

    this.ws.send({
      type: ClientCommandType.MINE,
      payload: `${cell.x},${cell.y}`
    });
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
