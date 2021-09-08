import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Cell, Player } from 'diggy-shared';
import { singleton } from 'tsyringe';

@singleton()
export class EventService {
  private _loggedIn = new BehaviorSubject<string>(undefined);
  private _mapLoaded = new BehaviorSubject<string>(undefined);
  private _players = new Subject<Player[]>();
  // TODO change name to be more 'cellFromServer'
  private _cell = new Subject<Cell>();
  private _cellClicked = new Subject<Cell>();
  private _cellClickStop = new Subject<void>();

  mapLoaded(map: string): void {
    this._mapLoaded.next(map);
  }
  onMapLoaded(): Observable<string> {
    return this._mapLoaded.asObservable();
  }

  loggedIn(login: string): void {
    this._loggedIn.next(login);
  }
  onLoggedIn(): Observable<string> {
    return this._loggedIn.asObservable();
  }

  players(players: Player[]): void {
    this._players.next(players);
  }
  onPlayers(): Observable<Player[]> {
    return this._players.asObservable();
  }

  cell(cell: Cell): void {
    this._cell.next(cell);
  }
  onCell(): Observable<Cell> {
    return this._cell.asObservable();
  }

  cellClicked(cell: Cell): void {
    this._cellClicked.next(cell);
  }
  onCellClicked(): Observable<Cell> {
    return this._cellClicked.asObservable();
  }

  cellClickStop(): void {
    this._cellClickStop.next();
  }
  onCellClickStop(): Observable<void> {
    return this._cellClickStop.asObservable();
  }
}
