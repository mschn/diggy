import { PLAYER_BASE_SPEED } from './constants';

export class Player {
  x = 0;
  y = 0;
  movingLeft = false;
  movingRight = false;
  speed = PLAYER_BASE_SPEED;

  airborne = false;
  jumpTime = 0;

  constructor(public name: string) {}

  moveLeft(state: boolean): void {
    this.movingLeft = state;
  }

  moveRight(state: boolean): void {
    this.movingRight = state;
  }

  jump(): void {
    if (this.airborne) {
      return;
    }
    this.airborne = true;
    this.jumpTime = 300;
  }
}
