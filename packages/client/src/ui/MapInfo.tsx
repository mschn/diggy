import * as React from 'react';
import { Cell } from 'diggy-shared';
import { ClientState } from '../client-state';

interface MapInfoProp {
  clientState: ClientState;
}

interface MapInfoState {
  cell: Cell;
}

export class MapInfo extends React.Component<MapInfoProp, MapInfoState> {
  componentDidMount(): void {
    this.props.clientState
      .onCellHovered()
      .subscribe((cell) => this.setState({ cell }));
  }

  render(): JSX.Element {
    return (
      <div>
        {this.state?.cell && (
          <div>
            <div>{this.state.cell.type.name}</div>
            <div>
              {this.state.cell.x} x {this.state.cell.y}
            </div>
          </div>
        )}
      </div>
    );
  }
}
