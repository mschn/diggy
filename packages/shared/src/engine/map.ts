import { Player } from '..';
import { Cell, CellTypes, CELL_TYPES, getCellType } from './cell';
import { CELL_SIZE } from './constants';

export class Map {
  cells: Cell[][];

  load(mapStr: string): void {
    const lines = mapStr.split('\n');
    this.cells = lines.map((line, i) =>
      line.split('').map((code, j) => {
        if (
          i === 0 ||
          i === lines.length - 1 ||
          j === 0 ||
          j === line.length - 1
        ) {
          // unbreakable map boundaries
          code = CELL_TYPES[CellTypes.UNBREAKABLE_STONE].code;
        }
        const cell = new Cell();
        cell.type = getCellType(code);
        cell.x = j;
        cell.y = i;
        cell.hp = cell.type.hp;
        cell.maxHp = cell.hp;
        return cell;
      })
    );
  }

  getSpawn(): Cell {
    let ret: Cell;
    this.cells.forEach((line, i) => {
      line.forEach((cell, j) => {
        if (cell.type === CELL_TYPES[CellTypes.SPAWN]) {
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

  mineCell(c: Cell): Cell {
    return this.mine(c.x, c.y);
  }

  mine(x: number, y: number): Cell {
    const cell = this.cells[y][x];
    if (!cell.type.isWall || cell.type.unbreakable) {
      return cell;
    }

    cell.hp -= 1;
    if (cell.hp === 0) {
      const c = new Cell();
      c.type = CELL_TYPES[CellTypes.SKY];
      c.x = x;
      c.y = y;
      c.hp = 0;
      this.cells[y][x] = c;
    }

    console.log(`[MINED] ${this.cells[y][x].toString()}`);
    return this.cells[y][x];
  }

  // draw a line between a player and a target cell,
  // return the first cell on the map that intersects with that line
  findClosestCell(p: Player, c: Cell): Cell {
    if (!p || !c) {
      return null;
    }

    const playerCell = this.getCell(p.x, p.y);
    const px = playerCell.x;
    const py = playerCell.y + 1;
    const cx = c.x;
    const cy = c.y;
    if (px === cx && py === cy) {
      return c;
    }
    let ix = px;
    let iy = py;
    const dx = cx - px;
    const dy = cy - py;
    const len = Math.sqrt(dx * dx + dy * dy);
    while (Math.round(ix) !== cx || Math.round(iy) !== cy) {
      ix += dx / len;
      iy += dy / len;
      const c = this.cells[Math.round(iy)][Math.round(ix)];
      if (c.type.isWall) {
        return c;
      }
    }
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
