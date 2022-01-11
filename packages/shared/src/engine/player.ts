import {
  Cell,
  CELL_SIZE,
  PLAYER_BASE_ATTACK_SPEED,
  PLAYER_BASE_JUMP
} from '..';
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

  // true to mark that the next engine tick will start an attack
  attacking = false;
  // true when attack has been triggerred and needs to be applied mid animation
  attackPending = false;
  // time of last attack
  lastAttack = 0;
  // minimum time in ms between 2 attacks
  attackSpeed = PLAYER_BASE_ATTACK_SPEED;

  lookX = 0;
  lookY = 0;

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
    this.jumpTime = PLAYER_BASE_JUMP;
  }

  attack(): void {
    return;
  }

  canAttackNow(): boolean {
    return this.canAttackAt(new Date().getTime());
  }

  canAttackAt(date: number): boolean {
    return date - this.lastAttack > this.attackSpeed;
  }

  canPerformAttack(date: number): boolean {
    return date > this.lastAttack + this.attackSpeed / 2;
  }

  isCellInRange(cell: Cell, range: number): boolean {
    if (!cell) {
      return false;
    }
    const dx = Math.abs(this.x - (cell.x + 0.5) * CELL_SIZE);
    const dy = Math.abs(this.y - cell.y * CELL_SIZE);
    return dx <= CELL_SIZE * range && dy <= CELL_SIZE * range;
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
      this.jumpTime,
      this.attacking ? 1 : 0,
      this.attackPending ? 1 : 0,
      this.lastAttack,
      this.attackSpeed,
      this.lookX,
      this.lookY
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
    ret.orientation =
      s[6] === '0' ? PlayerOrientation.LEFT : PlayerOrientation.RIGHT;
    ret.airborne = s[7] === '1';
    ret.jumpTime = Number.parseInt(s[8], 10);
    ret.attacking = s[9] === '1';
    ret.attackPending = s[10] === '1';
    ret.lastAttack = Number.parseInt(s[11]);
    ret.attackSpeed = Number.parseInt(s[12]);
    ret.lookX = Number.parseInt(s[13]);
    ret.lookY = Number.parseInt(s[14]);
    return ret;
  }
}
