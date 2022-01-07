export enum CellTypes {
  SKY,
  SPAWN,
  DIRT,
  STONE,
  UNBREAKABLE_STONE
}

type CellTypeEntries = Record<CellTypes, CellType>;
export const CELL_TYPES: CellTypeEntries = {
  [CellTypes.SKY]: {
    code: ' ',
    name: 'Sky',
    isWall: false,
    sprite: 'sky',
    hp: 0,
    unbreakable: true
  },
  [CellTypes.SPAWN]: {
    code: 'S',
    name: 'Spawn',
    isWall: false,
    sprite: 'sky',
    hp: 0,
    unbreakable: true
  },
  [CellTypes.DIRT]: {
    code: 'D',
    name: 'Dirt',
    isWall: true,
    sprite: 'dirt',
    hp: 1,
    unbreakable: false
  },
  [CellTypes.STONE]: {
    code: 'X',
    name: 'Stone',
    isWall: true,
    sprite: 'stone',
    hp: 2,
    unbreakable: false
  },
  [CellTypes.UNBREAKABLE_STONE]: {
    code: 'Z',
    name: 'Unbreakable Stone',
    isWall: true,
    sprite: 'stone',
    hp: 0,
    unbreakable: true
  }
};

export function getCellType(code: string): CellType {
  return (
    Object.values(CELL_TYPES).find((cellType) => cellType.code === code) ||
    CELL_TYPES[CellTypes.SKY]
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
  maxHp: number;

  toString(): string {
    return [this.type.code, this.x, this.y, `${this.hp}/${this.maxHp}`].join(
      ','
    );
  }

  static fromString(str: string): Cell {
    const c = str.split(',');
    const ret = new Cell();
    ret.type = getCellType(c[0]);
    ret.x = Number.parseInt(c[1], 10);
    ret.y = Number.parseInt(c[2], 10);

    const hp = c[3].split('/');
    ret.hp = Number.parseInt(hp[0], 10);
    ret.maxHp = Number.parseInt(hp[1], 10);
    return ret;
  }
}
