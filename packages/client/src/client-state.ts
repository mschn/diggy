import { Cell } from 'diggy-shared';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { singleton } from 'tsyringe';

@singleton()
export class ClientState {
  private _loggedIn = new BehaviorSubject<string>(undefined);
  private _cellHovered = new Subject<Cell>();
  private _cellSelected = new Subject<Cell>();
  private _attack = new Subject<boolean>();

  loggedIn(login: string): void {
    this._loggedIn.next(login);
  }
  onLoggedIn(): Observable<string> {
    return this._loggedIn.asObservable();
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

  attack(state: boolean): void {
    this._attack.next(state);
  }
  onAttack(): Observable<boolean> {
    return this._attack.asObservable();
  }
}
