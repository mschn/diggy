import { Cell } from './cell';
import { CELL_SIZE, GAME_LOOP_DELAY, PLAYER_SIZE } from './constants';
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
    // const player = this.spawnPlayer();
    // this.players.push(this.player);
  }

  spawnPlayer(name: string): void {
    const player = new Player(name);
    const spawn = this.map.getSpawn();
    player.x = spawn.x * CELL_SIZE;
    player.y = spawn.y * CELL_SIZE;
    this.players.push(player);
  }

  getPlayer(name: string): Player {
    return this.players.find(p => p.name === name);
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

        console.log('move left');

        x -= player.speed * dt;
        const cell = this.map.getCell(x - PLAYER_SIZE / 2, y);
        if (cell.type.isWall) {
          x = (cell.x + 1) * CELL_SIZE + 0.5 * PLAYER_SIZE;
        }
      }

      // move right
      if (player.movingRight) {
        x += player.speed * dt;
        const cell = this.map.getCell(x + PLAYER_SIZE / 2, y);
        if (cell.type.isWall) {
          x = cell.x * CELL_SIZE - 0.5 * PLAYER_SIZE;
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
            y = ground.y * CELL_SIZE - 0.5 * PLAYER_SIZE;
          }
        }
      }

      // detect fall
      if (player.jumpTime === 0) {
        const groundBelow = this.getGroundBelow(x, y);
        player.airborne = !groundBelow;
        if (groundBelow) {
          y = groundBelow.y * CELL_SIZE - 0.5 * PLAYER_SIZE;
        }
      }

      player.x = x;
      player.y = y;
    });

    this.onTick?.();
  }

  getGroundBelow(x: number, y: number): Cell {
    const cells = [x - PLAYER_SIZE / 2, x, x - 1 + PLAYER_SIZE / 2].map((tx) =>
      this.map.getCell(tx, y + PLAYER_SIZE / 2)
    );
    return cells.find((c) => c.type.isWall);
  }
}
