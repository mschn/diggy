export enum CellTypes {
  sky = 'SKY',
  stone = 'STONE',
  spawn = 'SPAWN'
}

type CellTypeEntries = Record<CellTypes, CellType>;
export const CELL_TYPES: CellTypeEntries = {
  [CellTypes.stone]: {
    code: 'X',
    name: 'Stone',
    isWall: true,
    sprite: 'stone'
  },
  [CellTypes.sky]: {
    code: ' ',
    name: 'Sky',
    isWall: false,
    sprite: 'sky'
  },
  [CellTypes.spawn]: {
    code: 'S',
    name: 'Spawn',
    isWall: false,
    sprite: 'stone'
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
}

export interface Cell {
  type: CellType;
  x: number;
  y: number;
}
