import * as React from 'react';
import { Stats, NetworkStat } from 'diggy-shared';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: absolute;
  color: white;
  font-family: monospace;
  font-size: 12px;
  padding: 5px;
  text-shadow: 1px 1px 2px black;
  user-select: none;
`;

interface IProp {
  stats: Stats;
}

interface IState {
  stats: NetworkStat;
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
      <Wrapper>
        <div>In:&nbsp;&nbsp;{this?.state?.stats?.formatIn()}</div>
        <div>Out:&nbsp;{this?.state?.stats?.formatOut()}</div>
      </Wrapper>
    );
  }
}
