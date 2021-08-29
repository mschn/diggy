import { PLAYER_BASE_SPEED } from './constants';

export enum PlayerOrientation {
  LEFT,
  RIGHT
}

export class Player {
  x = 0;
  y = 0;
  movingLeft = false;
  movingRight = false;
  speed = PLAYER_BASE_SPEED;
  orientation: PlayerOrientation = PlayerOrientation.RIGHT;
  airborne = false;
  jumpTime = 0;

  constructor(public name: string) {}

  moveLeft(state: boolean): void {
    this.orientation = PlayerOrientation.LEFT;
    this.movingLeft = state;
  }

  moveRight(state: boolean): void {
    this.orientation = PlayerOrientation.RIGHT;
    this.movingRight = state;
  }

  jump(): void {
    if (this.airborne) {
      return;
    }
    this.airborne = true;
    this.jumpTime = 300;
  }

  toString(): string {
    return [
      this.name,
      this.x,
      this.y,
      this.movingLeft ? 1 : 0,
      this.movingRight ? 1 : 0,
      this.speed,
      this.orientation,
      this.airborne ? 1 : 0,
      this.jumpTime
    ].join(',');
  }

  static fromString(str: string): Player {
    const s = str.split(',');
    const ret = new Player(s[0]);
    ret.x = Number.parseInt(s[1], 10);
    ret.y = Number.parseInt(s[2], 10);
    ret.movingLeft = s[3] === '1';
    ret.movingRight = s[4] === '1';
    ret.speed = Number.parseFloat(s[5]);
    ret.orientation = s[6] === '0' ? PlayerOrientation.LEFT : PlayerOrientation.RIGHT;
    ret.airborne = s[7] === '1';
    ret.jumpTime = Number.parseInt(s[8], 10);
    return ret;
  }
}
