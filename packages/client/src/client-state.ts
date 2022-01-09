import { Cell } from 'diggy-shared';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { singleton } from 'tsyringe';

export enum MouseButton {
  LEFT,
  RIGHT,
  OTHER
}

export interface MouseEvt {
  state: boolean;
  button: MouseButton;
}

@singleton()
export class ClientState {
  private _loggedIn = new BehaviorSubject<string>(undefined);

  private _mouseEvent = new Subject<MouseEvt>();
  private _cellHovered = new Subject<Cell>();
  private _cellSelected = new Subject<Cell>();

  loggedIn(login: string): void {
    this._loggedIn.next(login);
  }
  onLoggedIn(): Observable<string> {
    return this._loggedIn.asObservable();
  }

  mouseEvent(event: MouseEvt): void {
    this._mouseEvent.next(event);
  }
  onMouseEvent(): Observable<MouseEvt> {
    return this._mouseEvent.asObservable();
  }

  hoverCell(cell: Cell): void {
    this._cellHovered.next(cell);
  }
  onCellHovered(): Observable<Cell> {
    return this._cellHovered.asObservable();
  }

  selectCell(cell: Cell): void {
    this._cellSelected.next(cell);
  }
  onCellSelected(): Observable<Cell> {
    return this._cellSelected.asObservable();
  }
}
