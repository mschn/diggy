import {
  Player,
  PlayerOrientation,
  PLAYER_HEIGHT,
  PLAYER_WIDTH
} from 'diggy-shared';
import { Application, Sprite } from 'pixi.js';

export class PlayerGfx {
  sprite: Sprite;

  constructor(
    private readonly app: Application,
    public player: Player
  ) {
    this.sprite = new Sprite(this.app.loader.resources.player_stand.texture);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.width = PLAYER_WIDTH;
    this.sprite.height = PLAYER_HEIGHT;
    this.app.stage.addChild(this.sprite);
  }

  update(): void {
    if (this.player.jumpTime > 0) {
      this.sprite.texture = this.app.loader.resources.player_jump.texture;
    } else if (this.player.airborne) {
      this.sprite.texture = this.app.loader.resources.player_stand.texture;
    } else if (this.player.movingLeft || this.player.movingRight) {
      const spriteNum = (Math.floor(new Date().getTime() / 200) % 3) + 1;
      this.sprite.texture =
        this.app.loader.resources[`player_walk_${spriteNum}`].texture;
    } else {
      this.sprite.texture = this.app.loader.resources.player_stand.texture;
    }
    this.sprite.scale.x =
      this.player.orientation === PlayerOrientation.LEFT ? 1 : -1;

    // update player location
    this.sprite.x = this.player.x;
    this.sprite.y = this.player.y;
  }

  cleanup(): void {
    this.app.stage.removeChild(this.sprite);
    this.sprite.destroy();
  }

  centerAround(name: string): void {
    if (this.player.name === name) {
      this.app.stage.x = this.app.screen.width / 2 - this.player.x;
      this.app.stage.y = this.app.screen.height / 2 - this.player.y;
    }
  }
}
