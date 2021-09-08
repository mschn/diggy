import { Engine } from 'diggy-shared';
import { EventService } from './event-service';
import { Graphics } from './graphics/graphics';
import { ClientInput } from './input/client-input';
import { Ws } from './input/ws';
import { singleton } from 'tsyringe';

@singleton()
export class Client {
  constructor(
    private events: EventService,
    private engine: Engine,
    private input: ClientInput,
    private graphics: Graphics,
    private ws: Ws
  ) {}

  public start(): void {

    this.events.onMapLoaded().subscribe((map) => {
      this.engine.loadMap(map);
      this.engine.start();
      this.input.start();
      this.graphics.start();
    });



    this.ws.start();

  }
}
