import { Cell } from './cell';
import {
  CELL_SIZE,
  GAME_LOOP_DELAY,
  PLAYER_HEIGHT,
  PLAYER_WIDTH
} from './constants';
import { Map } from './map';
import { Player } from './player';

export class Engine {
  map: Map;
  players: Player[] = [];
  lastUpdateTime = Date.now();
  onTick: () => void;

  start(): void {
    setTimeout(() => this.update(), GAME_LOOP_DELAY);
  }

  loadMap(mapStr: string): void {
    this.map = new Map();
    this.map.load(mapStr);
  }

  spawnPlayer(name: string): void {
    const player = new Player(name);
    const spawn = this.map.getSpawn();
    player.x = spawn.x * CELL_SIZE;
    player.y = spawn.y * CELL_SIZE;
    this.players.push(player);
  }

  removePlayer(name: string): void {
    this.players = this.players.filter((p) => p.name !== name);
  }

  getPlayer(name: string): Player {
    return this.players.find((p) => p.name === name);
  }

  update(): void {
    const now = Date.now();
    const dt = now - this.lastUpdateTime;
    this.lastUpdateTime = now;
    setTimeout(() => this.update(), GAME_LOOP_DELAY);

    if (!this.map) {
      return;
    }

    this.players?.forEach((player) => {
      let x = player.x;
      let y = player.y;

      // move left
      if (player.movingLeft) {
        x -= player.speed * dt;
        const cells = [y - CELL_SIZE, y, y + CELL_SIZE].map((y) =>
          this.map.getCell(x - PLAYER_WIDTH / 2, y)
        );
        const wall = cells.find((c) => c.type.isWall);
        if (wall) {
          x = (wall.x + 1) * CELL_SIZE + 0.5 * PLAYER_WIDTH;
        }
      }

      // move right
      if (player.movingRight) {
        x += player.speed * dt;
        const cells = [y - CELL_SIZE, y, y + CELL_SIZE].map((y) =>
          this.map.getCell(x + PLAYER_WIDTH / 2, y)
        );
        const wall = cells.find((c) => c.type.isWall);
        if (wall) {
          x = wall.x * CELL_SIZE - 0.5 * PLAYER_WIDTH;
        }
      }

      // Jumping
      if (player.airborne && player.jumpTime > 0) {
        const jumpTime = Math.min(dt, player.jumpTime);
        y -= player.speed * jumpTime;
        player.jumpTime -= jumpTime;

        const ceiling = this.map.getCell(x, y - PLAYER_HEIGHT / 2);
        if (ceiling.type.isWall) {
          y = ceiling.y * CELL_SIZE + 1 * PLAYER_HEIGHT;
        }
      }

      // Fall
      if (player.jumpTime === 0) {
        if (player.airborne) {
          y += player.speed * dt;
        }
        const groundBelow = this.getGroundBelow(x, y);
        player.airborne = !groundBelow;
        if (groundBelow) {
          y = groundBelow.y * CELL_SIZE - 0.5 * PLAYER_HEIGHT;
        }
      }

      player.x = Math.round(x);
      player.y = Math.round(y);
    });

    this.onTick?.();
  }

  getGroundBelow(x: number, y: number): Cell {
    const cells = [x - PLAYER_WIDTH / 2, x, x - 1 + PLAYER_WIDTH / 2].map(
      (tx) => this.map.getCell(tx, y + PLAYER_HEIGHT / 2)
    );
    return cells.find((c) => c.type.isWall);
  }

  isInRange(cell: Cell, player: Player, range: number): boolean {
    const dx = Math.abs(player.x - (cell.x + 0.5) * CELL_SIZE);
    const dy = Math.abs(player.y - cell.y * CELL_SIZE);
    return dx <= CELL_SIZE * range && dy <= CELL_SIZE * range;
  }
}
