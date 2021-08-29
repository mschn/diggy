import { Cell, CellTypes, CELL_TYPES, getCellType } from './cell';
import { CELL_SIZE } from './constants';

export class Map {
  cells: Cell[][];

  load(mapStr: string): void {
    this.cells = mapStr.split('\n').map((line, i) =>
      line.split('').map((code, j) => {
        const cell = new Cell();
        cell.type = getCellType(code);
        cell.x = j;
        cell.y = i;
        cell.hp = cell.type.hp;
        return cell;
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

  mine(x: number, y: number): Cell {
    const cell = this.cells[y][x];
    if (!cell.type.isWall || cell.type.unbreakable) {
      return cell;
    }

    cell.hp -= 1;
    if (cell.hp === 0) {
      const c = new Cell();
      c.type = CELL_TYPES[CellTypes.sky];
      c.x = x;
      c.y = y;
      c.hp = 0;
      this.cells[y][x] = c;
    }
    return this.cells[y][x];
  }

  toString(): string {
    return this.cells
      .map((row) => {
        return row.reduce((acc, cell) => acc.concat(cell.type.code), '');
      })
      .join('\n');
  }
}
