import { Dict } from '@pixi/utils';
import {
  Cell,
  CELL_SIZE,
  Engine,
  PICKAXE_RANGE,
  PlayerOrientation,
  PLAYER_HEIGHT,
  PLAYER_WIDTH
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
export class Graphics {
  login: string;
  onCellClicked: (cell: Cell) => void;

  private app: Application;
  private players: Sprite[] = [];
  private map: Container;
  private cells: Sprite[][] = [];
  private mouseOverOutline: PixiGraphics;

  constructor(private readonly engine: Engine) {}

  start(): void {
    const canvas = document.querySelector('#main canvas') as HTMLCanvasElement;
    const wrapper = document.querySelector('#canvas-wrapper') as HTMLDivElement;
    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;
    window.addEventListener('resize', () => this.resizeCanvas());

    settings.SCALE_MODE = SCALE_MODES.NEAREST;
    settings.SCALE_MODE = SCALE_MODES.NEAREST;
    settings.RENDER_OPTIONS.antialias = false;
    settings.ROUND_PIXELS = true

    this.app = new Application({
      view: canvas,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      width,
      height
    });
    this.app.loader
      .add('player_stand', 'player_stand.png')
      .add('player_walk_1', 'player_walk_1.png')
      .add('player_walk_2', 'player_walk_2.png')
      .add('player_walk_3', 'player_walk_3.png')
      .add('player_jump', 'player_jump.png')
      .add('player_fall', 'player_fall.png')
      .add('sky', 'sky.png')
      .add('stone', 'stone.png')
      .add('dirt', 'dirt.png')
      .load((loader, resources) => {

        this.map = new Container();
        this.app.stage.addChild(this.map);

        this.renderMap(resources);

        this.app.ticker.add(() => this.update());
      });
  }

  resizeCanvas(): void {
    const wrapper = document.querySelector('#canvas-wrapper') as HTMLDivElement;
    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;
    this.app.renderer.resize(width, height);
  }

  addPlayer(): void {
    const player = new Sprite(this.app.loader.resources.player_stand.texture);
    player.anchor.set(0.5, 0.5);
    player.width = PLAYER_WIDTH;
    player.height = PLAYER_HEIGHT;
    this.players.push(player);
    this.app.stage.addChild(player);
  }

  removePlayer(): void {
    this.players.pop();
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

  update(): void {
    this.adjustPlayerCount();

    this.players.forEach((player, i) => {
      const enginePlayer = this.engine.players[i];

      if (enginePlayer.jumpTime > 0) {
        player.texture = this.app.loader.resources.player_jump.texture;
      } else if (enginePlayer.airborne) {
        player.texture = this.app.loader.resources.player_stand.texture;
      } else if (enginePlayer.movingLeft || enginePlayer.movingRight) {
        const spriteNum = (Math.floor(new Date().getTime() / 200) % 3) + 1;
        player.texture =
          this.app.loader.resources[`player_walk_${spriteNum}`].texture;
      } else {
        player.texture = this.app.loader.resources.player_stand.texture;
      }
      player.scale.x =
        enginePlayer.orientation === PlayerOrientation.LEFT ? 1 : -1;

      // update player location
      player.x = enginePlayer.x;
      player.y = enginePlayer.y;

      // center map around player
      if (enginePlayer.name === this.login) {
        this.app.stage.x = this.app.screen.width / 2 - this.players[i].x;
        this.app.stage.y = this.app.screen.height / 2 - this.players[i].y;
      }
    });
  }

  adjustPlayerCount(): void {
    while (this.players.length < this.engine.players.length) {
      this.addPlayer();
    }
    while (this.players.length > this.engine.players.length) {
      this.removePlayer();
    }
  }

  mouseOutCell(): void {
    if (this.mouseOverOutline) {
      this.map.removeChild(this.mouseOverOutline);
      document.querySelector('#ui').innerHTML = '';
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

    document.querySelector(
      '#ui'
    ).innerHTML = `${cell.x}x${cell.y} : ${cell.type.name}`;
  }
}
