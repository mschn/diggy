import * as React from 'react';
import { Stats, NetworkStat } from 'diggy-shared';

interface NetStatProp {
  stats: Stats
}

interface NetStatState {
  stats: NetworkStat
}

export class NetStatView extends React.Component<NetStatProp, NetStatState> {

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
