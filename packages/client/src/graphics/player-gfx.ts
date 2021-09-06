import {
  Player,
  PlayerOrientation,
  PLAYER_HEIGHT,
  PLAYER_WIDTH
} from 'diggy-shared';
import { Application, Sprite, Container } from 'pixi.js';

export class PlayerGfx {
  container: Container;
  head: Sprite;
  body: Sprite;
  legs: Sprite;
  larm: Sprite;
  rarm: Sprite;

  constructor(private readonly app: Application, public player: Player) {
    this.container = new Container();

    this.head = new Sprite(this.app.loader.resources.p_head.texture);
    this.head.anchor.set(0.5, 0.5);
    this.head.width = PLAYER_WIDTH;
    this.head.height = PLAYER_HEIGHT;
    this.container.addChild(this.head);

    this.body = new Sprite(this.app.loader.resources.p_body.texture);
    this.body.anchor.set(0.5, 0.5);
    this.body.width = PLAYER_WIDTH;
    this.body.height = PLAYER_HEIGHT;
    this.container.addChild(this.body);

    this.legs = new Sprite(this.app.loader.resources.p_leg.texture);
    this.legs.anchor.set(0.5, 0.5);
    this.legs.width = PLAYER_WIDTH;
    this.legs.height = PLAYER_HEIGHT;
    this.container.addChild(this.legs);

    this.larm = new Sprite(this.app.loader.resources.p_larm.texture);
    this.larm.anchor.set(0.5, 0.5);
    this.larm.width = PLAYER_WIDTH;
    this.larm.height = PLAYER_HEIGHT;
    this.container.addChild(this.larm);

    this.rarm = new Sprite(this.app.loader.resources.p_rarm.texture);
    this.rarm.anchor.set(0.5, 0.5);
    this.rarm.width = PLAYER_WIDTH;
    this.rarm.height = PLAYER_HEIGHT;
    this.container.addChild(this.rarm);

    this.app.stage.addChild(this.container);
  }

  update(): void {
    if (this.player.jumpTime > 0) {
      // JUMP
      this.legs.texture = this.app.loader.resources.p_leg_1.texture;
    } else if (this.player.airborne) {
      // FALL DOWN
      this.legs.texture = this.app.loader.resources.p_leg.texture;
    } else if (this.player.movingLeft || this.player.movingRight) {
      // RUN
      const spriteNum = (Math.floor(new Date().getTime() / 200) % 2) + 1;
      this.legs.texture =
        this.app.loader.resources[`p_leg_${spriteNum}`].texture;
    } else {
      // STAND
      this.legs.texture = this.app.loader.resources.p_leg.texture;
    }

    // MINE
    if (this.player.attacking) {
      const spriteNum = (Math.floor(new Date().getTime() / 200) % 2) + 1;
      this.rarm.texture =
        this.app.loader.resources[`p_rarm_${spriteNum}`].texture;
    } else {
      this.rarm.texture = this.app.loader.resources.p_rarm.texture;
    }

    // LEFT / RIGHT
    this.container.scale.x =
      this.player.orientation === PlayerOrientation.LEFT ? -1 : 1;

    // update player location
    this.container.x = this.player.x;
    this.container.y = this.player.y;
  }

  cleanup(): void {
    this.app.stage.removeChild(this.container);
    this.container.removeChildren();
    this.head.destroy();
    this.body.destroy();
    this.legs.destroy();
    this.larm.destroy();
    this.rarm.destroy();
  }

  centerAround(name: string): void {
    if (this.player.name === name) {
      this.app.stage.x = this.app.screen.width / 2 - this.player.x;
      this.app.stage.y = this.app.screen.height / 2 - this.player.y;
    }
  }
}
