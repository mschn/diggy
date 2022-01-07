import { singleton } from 'tsyringe';
import { PICKAXE_RANGE } from '..';
import { Cell } from './cell';
import {
  CELL_SIZE,
  GAME_LOOP_DELAY,
  PLAYER_HEIGHT,
  PLAYER_WIDTH
} from './constants';
import { GameState } from './game-state';
import { Map } from './map';
import { Player } from './player';

@singleton()
export class Engine {
  isServer = false;

  private map: Map;
  private players: Player[] = [];
  private lastUpdateTime = Date.now();

  constructor(private readonly state: GameState) {
    this.state.getMap().subscribe((map) => (this.map = map));
    this.state.getPlayers().subscribe((players) => (this.players = players));
  }

  start(): void {
    setTimeout(() => this.update(), GAME_LOOP_DELAY);
  }

  spawnPlayer(name: string): void {
    const player = new Player(name);
    const spawn = this.map.getSpawn();
    player.x = spawn.x * CELL_SIZE;
    player.y = spawn.y * CELL_SIZE;
    this.state.addPlayer(player);
  }

  removePlayer(name: string): void {
    this.state.removePlayer(name);
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

      // attack: start animation
      if (player.attacking && player.canAttackAt(now)) {
        player.lastAttack = now;
        player.attacking = false;
        player.attackPending = true;
      }

      // attack: perform hit mid-animation
      if (player.attackPending && player.canPerformAttack(now)) {
        player.attackPending = false;
        const lookCell = this.map.cells[player.lookY]?.[player.lookX];

        // only perform map alteration on server side, then notify clients
        if (player.isCellInRange(lookCell, PICKAXE_RANGE) && this.isServer) {
          const cell = this.map.mine(player.lookX, player.lookY);
          this.state.setCell(cell);
        }
      }

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

        const ceiling = this.getCeiling(x, y);
        if (ceiling) {
          player.jumpTime = 0;
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

    this.state.tick();
  }

  getCeiling(x: number, y: number): Cell {
    const cells = [x - PLAYER_WIDTH / 2, x, x - 1 + PLAYER_WIDTH / 2].map(
      (tx) => this.map.getCell(tx, y - PLAYER_HEIGHT / 2)
    );
    return cells.find((c) => c.type.isWall);
  }

  getGroundBelow(x: number, y: number): Cell {
    const cells = [x - PLAYER_WIDTH / 2, x, x - 1 + PLAYER_WIDTH / 2].map(
      (tx) => this.map.getCell(tx, y + PLAYER_HEIGHT / 2)
    );
    return cells.find((c) => c.type.isWall);
  }
}
