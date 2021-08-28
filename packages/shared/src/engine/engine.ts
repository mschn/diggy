import { Cell } from './cell';
import { CELL_SIZE, GAME_LOOP_DELAY, PLAYER_HEIGHT, PLAYER_WIDTH } from './constants';
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
        player.orientation = 'LEFT';
        x -= player.speed * dt;
        const cell = this.map.getCell(x - PLAYER_WIDTH / 2, y);
        if (cell.type.isWall) {
          x = (cell.x + 1) * CELL_SIZE + 0.5 * PLAYER_WIDTH;
        }
      }

      // move right
      if (player.movingRight) {
        player.orientation = 'RIGHT';
        x += player.speed * dt;
        const cell = this.map.getCell(x + PLAYER_WIDTH / 2, y);
        if (cell.type.isWall) {
          x = cell.x * CELL_SIZE - 0.5 * PLAYER_WIDTH;
        }
      }

      if (player.airborne) {
        // Jumping
        if (player.jumpTime > 0) {
          const jumpTime = Math.min(dt, player.jumpTime);
          y -= player.speed * jumpTime;
          player.jumpTime -= jumpTime;
          // TODO jump ceiling
        }
        // Falling
        else {
          y += player.speed * dt;
          const ground = this.getGroundBelow(x, y);
          if (ground) {
            // landing on the ground
            player.airborne = false;
            y = ground.y * CELL_SIZE - 0.5 * PLAYER_HEIGHT;
          }
        }
      }

      // detect fall
      if (player.jumpTime === 0) {
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
    const cells = [x - PLAYER_WIDTH / 2, x, x - 1 + PLAYER_WIDTH / 2].map((tx) =>
      this.map.getCell(tx, y + PLAYER_HEIGHT / 2)
    );
    return cells.find((c) => c.type.isWall);
  }
}
