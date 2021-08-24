import { Dict } from '@pixi/utils';
import { Engine, PLAYER_SIZE, CELL_SIZE, Cell } from 'diggy-shared';
import {
  Application,
  Container,
  LoaderResource,
  Sprite,
  Graphics as PixiGraphics
} from 'pixi.js';
export class Graphics {
  private app: Application;
  private player: Sprite;
  private map: Container;

  private mouseOverOutline: PixiGraphics;

  constructor(private readonly engine: Engine) {}

  start(): void {
    const canvas = document.querySelector('#main canvas') as HTMLCanvasElement;
    this.app = new Application({
      view: canvas,
      backgroundColor: 0x000000
    });
    this.app.loader
      .add('player', 'player.png')
      .add('sky', 'sky.png')
      .add('stone', 'stone.png')
      .load((loader, resources) => {
        this.player = new Sprite(resources.player.texture);
        this.player.anchor.set(0.5, 0.5);
        this.player.width = PLAYER_SIZE;
        this.player.height = PLAYER_SIZE;

        this.map = new Container();
        this.app.stage.addChild(this.map);
        this.app.stage.addChild(this.player);

        this.renderMap(resources);

        this.app.ticker.add(() => this.update());
      });
  }

  renderMap(resources: Dict<LoaderResource>): void {
    this.engine.map.forEach((line, i) => {
      line.forEach((cell, j) => {
        const sprite = new Sprite(resources[cell.type.sprite].texture);
        sprite.x = CELL_SIZE * j;
        sprite.y = CELL_SIZE * i;
        sprite.width = CELL_SIZE;
        sprite.height = CELL_SIZE;
        sprite.interactive = true;
        sprite.on('pointerover', () => this.mouseOverCell(cell, sprite));
        sprite.on('pointerout', () => this.mouseOutCell());
        this.map.addChild(sprite);
      });
    });
  }

  update(): void {
    // update player location
    this.player.x = this.engine.player.x;
    this.player.y = this.engine.player.y;

    // center map around player
    this.app.stage.x = this.app.screen.width / 2 - this.player.x;
    this.app.stage.y = this.app.screen.height / 2 - this.player.y;
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
    this.mouseOverOutline = new PixiGraphics();
    this.mouseOverOutline.lineStyle(1, 0xffffff, 1);
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
