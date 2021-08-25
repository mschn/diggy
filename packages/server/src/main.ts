import { Engine } from 'diggy-shared';
import { Server } from 'ws';

export class Main {
  public static start(): void {
    const engine = new Engine();
    engine.start();

    engine.map.forEach((row, j) => {
      console.log(row.reduce((acc, cell) => acc.concat(cell.type.code), ''));
    });

    const wss = new Server({ port: 8080});
    console.log(wss);
    wss.on('connection', function connection(ws) {
      ws.on('message', function incoming(message) {
        console.log('received: %s', message);
      });

      ws.send('something');
    });
  }
}

Main.start();
