import { Cell, CELL_TYPES, getCellType } from './cell';
import {
  CELL_SIZE,
  GAME_LOOP_DELAY,
  PLAYER_SIZE,
  STATIC_MAP
} from './constants';
import { Player } from './player';

export class Engine {
  map: Cell[][];
  player: Player;
  lastUpdateTime = Date.now();

  start(): void {
    this.player = new Player();
    this.loadMap();
    setTimeout(() => this.update(), GAME_LOOP_DELAY);
  }

  loadMap(): void {
    this.map = STATIC_MAP.split('\n').map((line, i) =>
      line.split('').map((code, j) => {
        return {
          type: getCellType(code),
          x: j,
          y: i
        };
      })
    );

    this.spawnPlayer();
  }

  spawnPlayer(): void {
    this.map.forEach((line, i) => {
      line.forEach((cell, j) => {
        if (cell.type === CELL_TYPES.SPAWN) {
          this.player.x = j * CELL_SIZE;
          this.player.y = i * CELL_SIZE;
        }
      });
    });
  }

  update(): void {
    const now = Date.now();
    const dt = now - this.lastUpdateTime;
    this.lastUpdateTime = now;
    setTimeout(() => this.update(), GAME_LOOP_DELAY);

    let x = this.player.x;
    let y = this.player.y;

    // move left
    if (this.player.movingLeft) {
      x -= this.player.speed * dt;
      const cell = this.getCell(x - PLAYER_SIZE / 2, y);
      if (cell.type.isWall) {
        x = (cell.x + 1) * CELL_SIZE + 0.5 * PLAYER_SIZE;
      }
    }

    // move right
    if (this.player.movingRight) {
      x += this.player.speed * dt;
      const cell = this.getCell(x + PLAYER_SIZE / 2, y);
      if (cell.type.isWall) {
        x = cell.x * CELL_SIZE - 0.5 * PLAYER_SIZE;
      }
    }

    if (this.player.airborne) {
      // Jumping
      if (this.player.jumpTime > 0) {
        const jumpTime = Math.min(dt, this.player.jumpTime);
        y -= this.player.speed * jumpTime;
        this.player.jumpTime -= jumpTime;
        // TODO jump ceiling
      }
      // Falling
      else {
        y += this.player.speed * dt;
        const ground = this.getGroundBelow(x, y);
        if (ground) {
          // landing on the ground
          this.player.airborne = false;
          y = ground.y * CELL_SIZE - 0.5 * PLAYER_SIZE;
        }
      }
    }

    // detect fall
    if (this.player.jumpTime === 0) {
      const groundBelow = this.getGroundBelow(x, y);
      this.player.airborne = !groundBelow;
      if (groundBelow) {
        y = groundBelow.y * CELL_SIZE - 0.5 * PLAYER_SIZE;
      }
    }

    this.player.x = x;
    this.player.y = y;
  }

  getGroundBelow(x: number, y: number): Cell {
    const cells = [x - PLAYER_SIZE / 2, x, x - 1 + PLAYER_SIZE / 2].map((tx) =>
      this.getCell(tx, y + PLAYER_SIZE / 2)
    );
    return cells.find((c) => c.type.isWall);
  }

  getCell(x: number, y: number): Cell {
    const cx = Math.trunc(x / CELL_SIZE);
    const cy = Math.trunc(y / CELL_SIZE);
    return this.map[cy][cx];
  }
}
