import { Dict } from '@pixi/utils';
import {
  Cell,
  CELL_SIZE,
  Engine,
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
import { PlayerGfx } from './player-gfx';
import { UI } from './ui';
export class Graphics {
  login: string;
  onCellClicked: (cell: Cell) => void;
  onCellClickStop: () => void;

  private app: Application;
  private playersGfx: PlayerGfx[] = [];
  private map: Container;
  private cells: Sprite[][] = [];
  private mouseOverOutline: PixiGraphics;

  private canvas: HTMLCanvasElement;
  private wrapper: HTMLDivElement;

  constructor(private readonly engine: Engine, private readonly ui: UI) {}

  start(): void {
    this.canvas = document.querySelector('#main canvas') as HTMLCanvasElement;
    this.wrapper = document.querySelector('#canvas-wrapper') as HTMLDivElement;
    window.addEventListener('resize', () => this.resizeCanvas());

    this.initPixi();
    this.loadTextures();

    this.app.loader.load((loader, resources) => {
      this.map = new Container();
      this.app.stage.addChild(this.map);
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
    this.engine.map.cells.forEach((line, i) => {
      const spriteRef = [];
      line.forEach((cell, j) => {
        const sprite = new Sprite(resources[cell.type.sprite].texture);
        sprite.x = CELL_SIZE * j;
        sprite.y = CELL_SIZE * i;
        sprite.width = CELL_SIZE;
        sprite.height = CELL_SIZE;
        sprite.interactive = true;
        sprite.on('pointerdown', () => this.onCellClicked(cell));
        sprite.on('pointerup', () => this.onCellClickStop());
        sprite.on('pointerover', () => this.mouseOverCell(cell, sprite));
        sprite.on('pointerout', () => this.mouseOutCell());
        this.map.addChild(sprite);
        spriteRef.push(sprite);
      });
      this.cells.push(spriteRef);
    });
  }

  updateCell(cell: Cell): void {
    const sprite = this.cells[cell.y][cell.x];
    sprite.texture = this.app.loader.resources[cell.type.sprite].texture;
  }

  updatePlayers(players: Player[]): void {
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
    this.engine.players.find((pe) => {
      if (!this.playersGfx.find((pg) => pg.player.name === pe.name)) {
        console.log(`adding new player ${pe.name}`);
        const newPlayerGfx = new PlayerGfx(this.app, pe);
        this.playersGfx.push(newPlayerGfx);
      }
    });

    this.playersGfx = this.playersGfx.filter((pg) => {
      if (!this.engine.players.find((pe) => pg.player.name === pe.name)) {
        console.log(`removing player ${pg.player.name}`);
        pg.cleanup();
        return false;
      }
      return true;
    });
  }

  mouseOutCell(): void {
    if (this.mouseOverOutline) {
      this.map.removeChild(this.mouseOverOutline);
      this.ui.clearInfo();
    }
  }

  mouseOverCell(cell: Cell, sprite: Sprite): void {
    if (!cell.type.isWall) {
      return;
    }

    const player = this.engine.getPlayer(this.login);
    const color = this.engine.isInRange(cell, player, PICKAXE_RANGE)
      ? '#ffffff'
      : '#ff0000';

    this.mouseOverOutline = new PixiGraphics();
    this.mouseOverOutline.lineStyle(1, utils.string2hex(color), 1);
    this.mouseOverOutline.drawRect(
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height
    );
    this.mouseOverOutline.endFill();
    this.map.addChild(this.mouseOverOutline);
    this.ui.showCellInfo(cell);
  }
}
