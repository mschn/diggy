import { NetworkStat, Stats } from 'diggy-shared';
import * as ReactDOM from 'react-dom';
import { singleton } from 'tsyringe';
import { ClientState } from '../client-state';
import { MapInfo } from './MapInfo';
import { NetStatView } from './NetStatView';
@singleton()
export class UI {
  uiDom: HTMLDivElement;

  netStats: NetworkStat;

  constructor(private clientState: ClientState, private stats: Stats) {
    this.uiDom = document.querySelector('#ui');

    ReactDOM.render(
      <MapInfo clientState={this.clientState} />,
      document.getElementById('ui-info-content')
    );
    ReactDOM.render(
      <NetStatView stats={this.stats} />,
      document.getElementById('net-stats')
    );
  }

  toggle(): void {
    this.uiDom.classList.toggle('d-none');
  }
}
