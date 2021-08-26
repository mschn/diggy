import { ClientCommandType, Engine } from 'diggy-shared';
import { Ws } from './ws';

export class ClientInput {
  canvas: HTMLCanvasElement;

  constructor(private readonly engine: Engine, private readonly ws: Ws) {}

  start(): void {
    this.canvas = document.querySelector('#main canvas');
    document.addEventListener('keydown', this.onKeydown.bind(this));
    document.addEventListener('keyup', this.onKeyup.bind(this));
  }

  onKeydown(e: KeyboardEvent): void {
    this.onKey(e, true);
  }

  onKeyup(e: KeyboardEvent): void {
    this.onKey(e, false);
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
  }

  moveLeft(start: boolean): void {
    // if (this.engine.player.movingLeft && start) {
    // return;
    // }
    this.ws.send({
      type: ClientCommandType.MOVE_LEFT,
      start
    });
    // this.engine.player.moveLeft(start);
  }

  moveRight(start: boolean): void {
    // if (this.engine.player.movingRight && start) {
    // return;
    // }
    this.ws.send({
      type: ClientCommandType.MOVE_RIGHT,
      start
    });
    // this.engine.player.moveRight(start);
  }

  jump(start: boolean): void {
    // if (this.engine.player.airborne && start) {
    // return;
    // }
    this.ws.send({
      type: ClientCommandType.JUMP,
      start
    });
    // this.engine.player.jump();
  }
}
