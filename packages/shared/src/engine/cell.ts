export enum CellTypes {
  sky = 'SKY',
  stone = 'STONE',
  spawn = 'SPAWN',
  dirt = 'DIRT'
}

type CellTypeEntries = Record<CellTypes, CellType>;
export const CELL_TYPES: CellTypeEntries = {
  [CellTypes.dirt]: {
    code: 'D',
    name: 'Dirt',
    isWall: true,
    sprite: 'dirt',
    hp: 1,
    unbreakable: false
  },
  [CellTypes.stone]: {
    code: 'X',
    name: 'Stone',
    isWall: true,
    sprite: 'stone',
    hp: 2,
    unbreakable: false
  },
  [CellTypes.sky]: {
    code: ' ',
    name: 'Sky',
    isWall: false,
    sprite: 'sky',
    hp: 0,
    unbreakable: true
  },
  [CellTypes.spawn]: {
    code: 'S',
    name: 'Spawn',
    isWall: false,
    sprite: 'sky',
    hp: 0,
    unbreakable: true
  }
};

export function getCellType(code: string): CellType {
  return (
    Object.values(CELL_TYPES).find((cellType) => cellType.code === code) ||
    CELL_TYPES.SKY
  );
}

export interface CellType {
  code: string;
  name: string;
  isWall: boolean;
  sprite: string;
  hp: number;
  unbreakable: boolean;
}

export class Cell {
  type: CellType;
  x: number;
  y: number;
  hp: number;

  toString(): string {
    const ret =  [this.type.code, this.x, this.y, this.hp].join(',');
    console.log(ret);
    return ret;
  }

  static fromString(str: string): Cell {
    const c = str.split(',');
    const ret = new Cell();
    ret.type = getCellType(c[0]);
    ret.x = Number.parseInt(c[1], 10);
    ret.y = Number.parseInt(c[2], 10);
    ret.hp = Number.parseInt(c[3], 10);
    return ret;
  }
}
