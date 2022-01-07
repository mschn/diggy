import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { singleton } from 'tsyringe';
import { Cell } from './cell';
import { Map } from './map';
import { Player } from './player';

@singleton()
export class GameState {
  private readonly map = new BehaviorSubject<Map>(undefined);
  private readonly players = new BehaviorSubject<Player[]>([]);
  private readonly _tick = new Subject<void>();
  private readonly _cell = new Subject<Cell>();

  getMap(): Observable<Map> {
    return this.map.asObservable();
  }
  setMap(map: Map): void {
    this.map.next(map);
  }
  loadMap(mapStr: string): void {
    const map = new Map();
    map.load(mapStr);
    this.setMap(map);
  }

  onUpdateCell(): Observable<Cell> {
    return this._cell.asObservable();
  }

  setCell(cell: Cell): void {
    const map = this.map.getValue();
    map.cells[cell.y][cell.x] = cell;
    console.log(`[SET CELL] ${cell.toString()}`);
    this._cell.next(cell);
  }
  onCell(): Observable<Cell> {
    return this._cell.asObservable();
  }

  getPlayers(): Observable<Player[]> {
    return this.players;
  }
  setPlayers(players: Player[]): void {
    this.players.next(players);
  }
  addPlayer(player: Player): void {
    const players = this.players.getValue();
    players.push(player);
    this.players.next(players);
  }
  removePlayer(name: string): void {
    const players = this.players.getValue().filter((p) => p.name !== name);
    this.players.next(players);
  }

  tick(): void {
    this._tick.next();
  }
  onTick(): Observable<void> {
    return this._tick.asObservable();
  }
}
