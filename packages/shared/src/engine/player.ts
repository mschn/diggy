import { PLAYER_BASE_SPEED } from './constants';

export class Player {
  x = 0;
  y = 0;
  movingLeft = false;
  movingRight = false;
  walkingSince: number;
  speed = PLAYER_BASE_SPEED;
  orientation: 'LEFT' | 'RIGHT' = 'RIGHT';


  airborne = false;
  jumpTime = 0;

  constructor(public name: string) {}

  moveLeft(state: boolean): void {
    this.orientation = 'LEFT';
    this.movingLeft = state;
    this.walkingSince = new Date().getTime();
  }

  moveRight(state: boolean): void {
    this.orientation = 'RIGHT';
    this.movingRight = state;
    this.walkingSince = new Date().getTime();
  }

  jump(): void {
    if (this.airborne) {
      return;
    }
    this.airborne = true;
    this.jumpTime = 300;
  }
}
