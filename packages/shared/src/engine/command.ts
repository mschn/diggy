export interface Command {
  type: ClientCommandType | ServerCommandType;
  payload: string;
}

export enum ClientCommandType {
  MOVE_LEFT,
  MOVE_RIGHT,
  JUMP,
  LOOK,
  ATTACK
}

export enum ServerCommandType {
  LOGGED_IN,
  MAP,
  PLAYERS,
  CELL
}
