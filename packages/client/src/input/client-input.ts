import {
  Cell,
  ClientCommandType,
  GameState,
  Map,
  Player,
  PlayerOrientation
} from 'diggy-shared';
import { singleton } from 'tsyringe';
import { ClientState } from '../client-state';
import { UI } from '../ui/ui';
import { Ws } from './ws';

@singleton()
export class ClientInput {
  canvas: HTMLCanvasElement;
  login: string;
  players: Player[];
  map: Map;

  hoveredCell: Cell;
  keepAttacking = false;

  constructor(
    private ws: Ws,
    private ui: UI,
    private state: ClientState,
    private game: GameState
  ) {
    this.game.getPlayers().subscribe((players) => (this.players = players));
    this.game.getMap().subscribe((map) => (this.map = map));
    this.game.onTick().subscribe(() => this.doAttack());

    this.state.onCellHovered().subscribe((cell) => this.onCellHovered(cell));
    this.state.onAttack().subscribe((state) => {
      this.keepAttacking = state;
      this.doAttack();
    });
    this.state.onLoggedIn().subscribe((login) => (this.login = login));
  }

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

  onCellHovered(cell: Cell): void {
    // hovered cell is used every tick to check if we need to attack
    this.hoveredCell = cell;

    // send left / right orientation to server
    // dont send full look coordinates all the time to prevent waste
    const player = this.getPlayer();
    const pcell = this.map.getCell(player.x, player.y);
    if (pcell && cell) {
      const newOrientation =
        cell.x < pcell.x ? PlayerOrientation.LEFT : PlayerOrientation.RIGHT;
      if (player.orientation !== newOrientation) {
        player.orientation = newOrientation;
        this.ws.send({
          type: ClientCommandType.LOOK,
          payload: newOrientation === PlayerOrientation.RIGHT ? '1' : '0'
        });
      }
    }
  }

  onKey(e: KeyboardEvent, isKeyDown: boolean): void {
    if (e.key === 'a') {
      this.moveLeft(isKeyDown);
    }
    if (e.key === 'd') {
      this.moveRight(isKeyDown);
    }
    if ((e.key === 'w' || e.key === ' ') && isKeyDown) {
      this.jump(isKeyDown);
    }
    if (e.key === 'c' && isKeyDown) {
      this.ui.toggle();
      window.dispatchEvent(new Event('resize'));
    }
  }

  moveLeft(start: boolean): void {
    if (this.getPlayer().movingLeft && start) {
      return;
    }
    this.ws.send({
      type: ClientCommandType.MOVE_LEFT,
      payload: start ? '1' : '0'
    });
  }

  moveRight(start: boolean): void {
    if (this.getPlayer().movingRight && start) {
      return;
    }
    this.ws.send({
      type: ClientCommandType.MOVE_RIGHT,
      payload: start ? '1' : '0'
    });
  }

  jump(start: boolean): void {
    if (this.getPlayer().airborne && start) {
      return;
    }
    this.ws.send({
      type: ClientCommandType.JUMP,
      payload: start ? '1' : '0'
    });
  }

  private doAttack(): void {
    const player = this.getPlayer();
    if (this.keepAttacking && player.canAttackNow()) {
      player.lastAttack = Date.now();
      player.attacking = true;
      this.ws.send({
        type: ClientCommandType.ATTACK,
        payload: `${this.hoveredCell?.x},${this.hoveredCell?.y}`
      });
    }
  }

  private getPlayer(): Player {
    return this.players.find((p) => p.name === this.login);
  }
}
