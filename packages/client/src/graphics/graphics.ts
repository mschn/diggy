import { Dict } from '@pixi/utils';
import * as PIXI from 'pixi.js';
import { Engine, PLAYER_SIZE, CELL_SIZE } from 'diggy-shared';
export class Graphics {
  private app: PIXI.Application;
  private player: PIXI.Sprite;
  private map: PIXI.Container;

  constructor(private readonly engine: Engine) {}

  start(): void {
    const canvas = document.querySelector('#main canvas') as HTMLCanvasElement;
    this.app = new PIXI.Application({
      view: canvas,
      backgroundColor: 0x000000
    });
    this.app.loader
      .add('player', 'player.png')
      .add('sky', 'sky.png')
      .add('stone', 'stone.png')
      .load((loader, resources) => {
        this.player = new PIXI.Sprite(resources.player.texture);
        this.player.anchor.set(0.5, 0.5);
        this.player.width = PLAYER_SIZE;
        this.player.height = PLAYER_SIZE;

        this.map = new PIXI.Container();
        this.app.stage.addChild(this.map);
        this.app.stage.addChild(this.player);

        this.renderMap(resources);

        this.app.ticker.add(() => this.update());
      });
  }

  renderMap(resources: Dict<PIXI.LoaderResource>): void {
    this.engine.map.forEach((line, i) => {
      line.forEach((cell, j) => {
        const sprite = new PIXI.Sprite(resources[cell.type.sprite].texture);
        sprite.x = CELL_SIZE * j;
        sprite.y = CELL_SIZE * i;
        sprite.width = CELL_SIZE;
        sprite.height = CELL_SIZE;
        sprite.interactive = true;
        sprite.on(
          'pointerover',
          () => {
            console.log(`${cell.type.name} ${cell.x} ${cell.y}`);
          },
          this
        );
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
}
