import { Cell } from 'diggy-shared';
import { singleton } from 'tsyringe';

@singleton()
export class UI {
  uiDom: HTMLDivElement;
  infoDom: HTMLDivElement;

  constructor() {
    this.uiDom = document.querySelector('#ui');
    this.infoDom = document.querySelector('#ui-info-content') as HTMLDivElement;
  }

  toggle(): void {
    this.uiDom.classList.toggle('d-none');
  }

  showCellInfo(cell: Cell): void {
    this.infoDom.innerHTML = `${cell.x}x${cell.y} : ${cell.type.name}`;
  }

  clearInfo(): void {
    this.infoDom.innerHTML = '';
  }
}
