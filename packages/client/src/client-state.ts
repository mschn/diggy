import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Cell, Player } from 'diggy-shared';
import { singleton } from 'tsyringe';

@singleton()
export class ClientState {
  private _loggedIn = new BehaviorSubject<string>(undefined);
  // TODO change name to be more 'cellFromServer'
  private _cell = new Subject<Cell>();
  private _cellClicked = new Subject<Cell>();
  private _cellClickStop = new Subject<void>();

  loggedIn(login: string): void {
    this._loggedIn.next(login);
  }
  onLoggedIn(): Observable<string> {
    return this._loggedIn.asObservable();
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
