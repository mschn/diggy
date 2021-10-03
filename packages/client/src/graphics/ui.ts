import { Cell, Stats } from 'diggy-shared';
import { singleton } from 'tsyringe';
import { ClientState } from '../client-state';

@singleton()
export class UI {
  uiDom: HTMLDivElement;
  infoDom: HTMLDivElement;
  statsDom: HTMLDivElement;

  constructor(private clientState: ClientState, private stats: Stats) {
    this.uiDom = document.querySelector('#ui');
    this.infoDom = document.querySelector('#ui-info-content') as HTMLDivElement;
    this.statsDom = document.querySelector('#stats') as HTMLDivElement;

    this.clientState.onCellHovered().subscribe((cell) => {
      if (cell) {
        this.showCellInfo(cell);
      } else {
        this.clearInfo();
      }
    });

    this.stats.getNetStats().subscribe((netStats) => {
      this.statsDom.innerHTML = `${netStats.formatIn()}<br>${netStats.formatOut()}`;
    });
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
