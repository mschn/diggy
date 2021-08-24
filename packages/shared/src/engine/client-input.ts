import { Engine } from './engine';

export class ClientInput {
  canvas: HTMLCanvasElement;

  constructor(private readonly engine: Engine) {}

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
    if (e.key === 'ArrowLeft') {
      this.engine.player.moveLeft(isKeyDown);
    }
    if (e.key === 'ArrowRight') {
      this.engine.player.moveRight(isKeyDown);
    }
    if (e.key === 'ArrowUp' && isKeyDown) {
      this.engine.player.jump();
    }
  }
}
