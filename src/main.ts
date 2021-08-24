import { ClientInput } from './engine/ClientInput';
import { Engine } from './engine/engine';
import { Graphics } from './graphics/graphics';

export class Main {
  public static start(): void {
    const engine = new Engine();
    engine.start();

    const graphics = new Graphics(engine);
    graphics.start();

    const input = new ClientInput(engine);
    input.start();
  }
}
