import { Dict } from '@pixi/utils';
import {
  Cell,
  CELL_SIZE,
  GameState,
  Map,
  PICKAXE_RANGE,
  Player
} from 'diggy-shared';
import {
  Application,
  Container,
  Graphics as PixiGraphics,
  LoaderResource,
  SCALE_MODES,
  settings,
  Sprite,
  utils
} from 'pixi.js';
import { singleton } from 'tsyringe';
import { ClientState } from '../client-state';
import { PlayerGfx } from './player-gfx';

@singleton()
export class Graphics {
  login: string;

  private players: Player[];
  private map: Map;

  private app: Application;
  private playersGfx: PlayerGfx[] = [];
  private mapContainer: Container;
  private cells: Sprite[][] = [];
  private mouseOverOutline: PixiGraphics;
  private selectedCellOutline: PixiGraphics;
  private leftClickDown = false;
  private hoveredCell: Cell;

  private canvas: HTMLCanvasElement;
  private wrapper: HTMLDivElement;

  constructor(private clientState: ClientState, private gameState: GameState) {}

  start(): void {
    this.canvas = document.querySelector('#main canvas') as HTMLCanvasElement;
    this.wrapper = document.querySelector('#canvas-wrapper') as HTMLDivElement;
    window.addEventListener('resize', () => this.resizeCanvas());

    // disable right click menu in game area: replaced with cell info selection
    this.canvas.oncontextmenu = () => false;

    this.canvas.addEventListener('pointerdown', (event) => {
      // left click
      if (event.buttons === 1) {
        this.leftClickDown = true;
        this.clientState.attack(true);
      } else if (event.buttons === 2) {
        this.clientState.selectCell(this.hoveredCell);
      }
    });
    this.canvas.addEventListener('pointerup', () => {
      // left click up
      if (this.leftClickDown) {
        this.leftClickDown = false;
        this.clientState.attack(false);
      }
    });

    this.clientState.onLoggedIn().subscribe((login) => (this.login = login));
    this.clientState
      .onCellSelected()
      .subscribe((cell) => this.selectCell(cell));

    this.gameState
      .getPlayers()
      .subscribe((players) => this.updatePlayers(players));
    this.gameState.getMap().subscribe((map) => (this.map = map));
    this.gameState.onUpdateCell().subscribe((cell) => this.updateCell(cell));

    this.initPixi();
    this.loadTextures();

    this.app.loader.load((loader, resources) => {
      this.mapContainer = new Container();
      this.app.stage.addChild(this.mapContainer);
      this.renderMap(resources);
      this.app.ticker.add(() => this.update());
    });
  }

  initPixi(): void {
    settings.SCALE_MODE = SCALE_MODES.NEAREST;
    settings.SCALE_MODE = SCALE_MODES.NEAREST;
    settings.RENDER_OPTIONS.antialias = false;
    settings.ROUND_PIXELS = true;
    const width = this.wrapper.clientWidth;
    const height = this.wrapper.clientHeight;
    this.app = new Application({
      view: this.canvas,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      width,
      height
    });
  }

  loadTextures(): void {
    this.app.loader
      .add('player_stand', 'player_stand.png')
      .add('player_walk_1', 'player_walk_1.png')
      .add('player_walk_2', 'player_walk_2.png')
      .add('player_walk_3', 'player_walk_3.png')
      .add('player_jump', 'player_jump.png')
      .add('player_fall', 'player_fall.png');

    this.app.loader
      .add('p_body', 'p_body.png')
      .add('p_head', 'p_head.png')
      .add('p_larm', 'p_larm.png')
      .add('p_leg', 'p_leg.png')
      .add('p_leg_1', 'p_leg_1.png')
      .add('p_leg_2', 'p_leg_2.png')
      .add('p_rarm', 'p_rarm.png')
      .add('p_rarm_1', 'p_rarm_1.png')
      .add('p_rarm_2', 'p_rarm_2.png');

    this.app.loader
      .add('sky', 'sky.png')
      .add('stone', 'stone.png')
      .add('dirt', 'dirt.png');
  }

  resizeCanvas(): void {
    const wrapper = document.querySelector('#canvas-wrapper') as HTMLDivElement;
    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;
    this.app.renderer.resize(width, height);
  }

  renderMap(resources: Dict<LoaderResource>): void {
    this.map.cells.forEach((line, i) => {
      const spriteRef = [];
      line.forEach((cell, j) => {
        const sprite = new Sprite(resources[cell.type.sprite].texture);
        sprite.x = CELL_SIZE * j;
        sprite.y = CELL_SIZE * i;
        sprite.width = CELL_SIZE;
        sprite.height = CELL_SIZE;
        sprite.interactive = true;
        sprite.on('pointerover', () => this.mouseOverCell(cell));
        sprite.on('pointerout', () => this.mouseOutCell());
        this.mapContainer.addChild(sprite);
        spriteRef.push(sprite);
      });
      this.cells.push(spriteRef);
    });
  }

  updateCell(cell: Cell): void {
    const sprite = this.cells[cell.y][cell.x];
    sprite.off('pointerover');
    sprite.on('pointerover', () => this.mouseOverCell(cell));
    sprite.texture = this.app.loader.resources[cell.type.sprite].texture;
    this.mouseOutCell();
    this.mouseOverCell(this.hoveredCell);
  }

  updatePlayers(players: Player[]): void {
    this.players = players;
    this.playersGfx.forEach((pg) => {
      players.forEach((p) => {
        if (p.name === pg.player.name) {
          pg.player = p;
        }
      });
    });
  }

  update(): void {
    this.adjustPlayerCount();
    this.playersGfx.forEach((player) => {
      player.update();
      player.centerAround(this.login);
    });
  }

  adjustPlayerCount(): void {
    this.players.find((pe) => {
      if (!this.playersGfx.find((pg) => pg.player.name === pe.name)) {
        const newPlayerGfx = new PlayerGfx(this.app, pe);
        this.playersGfx.push(newPlayerGfx);
      }
    });

    this.playersGfx = this.playersGfx.filter((pg) => {
      if (!this.players.find((pe) => pg.player.name === pe.name)) {
        pg.cleanup();
        return false;
      }
      return true;
    });
  }

  mouseOutCell(): void {
    if (this.mouseOverOutline) {
      this.mapContainer.removeChild(this.mouseOverOutline);
      this.clientState.hoverCell(null);
    }
  }

  mouseOverCell(cell: Cell): void {
    if (!cell) {
      return;
    }

    this.hoveredCell = cell;
    this.clientState.hoverCell(cell);

    const player = this.players.find((p) => p.name === this.login);
    const targetedCell = this.map.findClosestCell(player, cell);
    const sprite = this.cells[targetedCell.y][targetedCell.x];
    if (
      !player.isCellInRange(targetedCell, PICKAXE_RANGE) ||
      !targetedCell.type.isWall
    ) {
      return;
    }

    this.mouseOverOutline = new PixiGraphics();
    this.mouseOverOutline.lineStyle(1, utils.string2hex('#ffffff'), 1);
    this.mouseOverOutline.drawRect(
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height
    );
    this.mouseOverOutline.endFill();
    this.mapContainer.addChild(this.mouseOverOutline);
  }

  selectCell(cell: Cell): void {
    if (this.selectedCellOutline) {
      this.mapContainer.removeChild(this.selectedCellOutline);
    }
    const sprite = this.cells[cell.y][cell.x];
    this.selectedCellOutline = new PixiGraphics();
    this.selectedCellOutline.lineStyle(1, utils.string2hex('#ffffff'), 1);
    this.selectedCellOutline.drawRect(
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height
    );
    this.selectedCellOutline.endFill();
    this.mapContainer.addChild(this.selectedCellOutline);
  }
}
