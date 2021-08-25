import { Engine } from 'diggy-shared';

export class Server {
  public static start(): void {
    const engine = new Engine();
    engine.start();

    engine.map.forEach((row, j) => {
      console.log(row.reduce((acc, cell) => acc.concat(cell.type.code), ''));
    });

  }
}
