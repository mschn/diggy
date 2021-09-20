import { Cell } from 'diggy-shared';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { singleton } from 'tsyringe';

@singleton()
export class ClientState {
  private _loggedIn = new BehaviorSubject<string>(undefined);
  // TODO change name to be more 'cellFromServer'
  private _cell = new Subject<Cell>();

  private _mouseDown = new Subject<boolean>();
  private _cellHovered = new Subject<Cell>();

  loggedIn(login: string): void {
    this._loggedIn.next(login);
  }
  onLoggedIn(): Observable<string> {
    return this._loggedIn.asObservable();
  }

  mouseDown(state: boolean): void {
    this._mouseDown.next(state);
  }
  onMouseDown(): Observable<boolean> {
    return this._mouseDown.asObservable();
  }

  hoverCell(cell: Cell): void {
    this._cellHovered.next(cell);
  }
  onCellHovered(): Observable<Cell> {
    return this._cellHovered.asObservable();
  }
}
