import { Player } from "./player";

export interface Command {
  type: ClientCommandType | ServerCommandType;
}

export enum ClientCommandType {
  MOVE_LEFT = 'MOVE_LEFT',
  MOVE_RIGHT = 'MOVE_RIGHT',
  JUMP = 'JUMP'
}

export enum ServerCommandType {
  LOGGED_IN = 'LOGGED_IN',
  MAP = 'MAP',
  PLAYERS = 'PLAYERS'
}

export interface MoveLeftCommand extends Command {
  start: boolean;
}

export interface MoveRightCommand extends Command {
  start: boolean;
}

export interface JumpCommand extends Command {
  start?: boolean;
}

export interface MapCommand extends Command {
  map: string;
}

export interface LoginCommand extends Command {
  user: string;
}

export interface LoggedInCommand extends Command {
  user: string;
}

export interface PlayersCommand extends Command {
  players: Player[];
}
