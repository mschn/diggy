import { Cell } from 'diggy-shared';
import { singleton } from 'tsyringe';
import { ClientState } from '../client-state';

@singleton()
export class UI {
  uiDom: HTMLDivElement;
  infoDom: HTMLDivElement;


  constructor(private clientState: ClientState) {
    this.uiDom = document.querySelector('#ui');
    this.infoDom = document.querySelector('#ui-info-content') as HTMLDivElement;

    this.clientState.onCellHovered().subscribe(cell => {
      if (cell) {
        this.showCellInfo(cell);
      } else {
        this.clearInfo();
      }
    })

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
