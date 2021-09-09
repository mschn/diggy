import { Engine, GameState } from 'diggy-shared';
import { singleton } from 'tsyringe';
import { Graphics } from './graphics/graphics';
import { ClientInput } from './input/client-input';
import { Ws } from './input/ws';

@singleton()
export class Client {
  constructor(
    private game: GameState,
    private engine: Engine,
    private input: ClientInput,
    private graphics: Graphics,
    private ws: Ws
  ) {}

  public start(): void {
    this.game.getMap().subscribe((map) => {
      if (map) {
        this.engine.start();
        this.input.start();
        this.graphics.start();
      }
    });

    this.ws.start();
  }
}
