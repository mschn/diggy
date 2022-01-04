import * as React from 'react';
import { Stats, NetworkStat } from 'diggy-shared';

interface IProp {
  stats: Stats
}

interface IState {
  stats: NetworkStat
}

export class NetStatView extends React.Component<IProp, IState> {

  componentDidMount(): void {
    this.props.stats.getNetStats().subscribe((stats) => {
      this.setState({
        stats
      });
      this.render();
    });
  }

  render(): JSX.Element {
    return (
      <div>
        <div>{this?.state?.stats?.formatIn()}</div>
        <div>{this?.state?.stats?.formatOut()}</div>
      </div>
    );
  }
}