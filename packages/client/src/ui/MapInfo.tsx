import { Cell } from 'diggy-shared';
import * as React from 'react';
import { ClientState } from '../client-state';
import styled from 'styled-components';

interface IProp {
  clientState: ClientState;
}

interface IState {
  cell: Cell;
}

const Wrapper = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 200px;
  height: 200px;
  border: 2px solid red;
  background: #ccc;
  padding: 1rem;
`;

export class MapInfo extends React.Component<IProp, IState> {
  componentDidMount(): void {
    this.props.clientState
      .onCellHovered()
      .subscribe((cell) => this.setState({ cell }));
  }

  render(): JSX.Element {
    return (
      <Wrapper>
        <h3>Info</h3>
        {this.state?.cell && (
          <div>
            <div>{this.state.cell.type.name}</div>
            <div>
              {this.state.cell.x} x {this.state.cell.y}
            </div>
          </div>
        )}
      </Wrapper>
    );
  }
}
