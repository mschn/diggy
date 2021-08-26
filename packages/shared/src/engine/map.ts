import { Cell, CELL_TYPES, getCellType } from './cell';
import { CELL_SIZE } from './constants';

export class Map {
  cells: Cell[][];

  load(mapStr: string): void {
    this.cells = mapStr.split('\n').map((line, i) =>
      line.split('').map((code, j) => {
        return {
          type: getCellType(code),
          x: j,
          y: i
        };
      })
    );
  }

  getSpawn(): Cell {
    let ret: Cell;
    this.cells.forEach((line, i) => {
      line.forEach((cell, j) => {
        if (cell.type === CELL_TYPES.SPAWN) {
          ret = cell;
        }
      });
    });
    return ret;
  }

  getCell(x: number, y: number): Cell {
    const cx = Math.trunc(x / CELL_SIZE);
    const cy = Math.trunc(y / CELL_SIZE);
    return this.cells[cy][cx];
  }

  toString(): string {
    return this.cells
      .map((row) => {
        return row.reduce((acc, cell) => acc.concat(cell.type.code), '');
      })
      .join('\n');
  }
}
