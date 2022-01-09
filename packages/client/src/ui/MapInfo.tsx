import { Cell, GameState } from 'diggy-shared';
import * as React from 'react';
import { ClientState } from '../client-state';
import styled from 'styled-components';

interface IProp {
  clientState: ClientState;
  gameState: GameState;
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
  border: 2px solid #888;
  background: #ccc;
  padding: 1rem;
`;

export class MapInfo extends React.Component<IProp, IState> {
  componentDidMount(): void {
    this.props.clientState
      .onCellSelected()
      .subscribe((cell) => this.setState({ cell }));
    this.props.gameState.onCell().subscribe((cell) => {
      if (cell.x === this.state?.cell?.x && cell.y === this.state?.cell?.y) {
        this.setState({ cell });
      }
    });
  }

  render(): JSX.Element {
    return (
      <Wrapper>
        {this.state?.cell && (
          <div>
            <h4 className="mt-0 align-bottom">
              <img
                src={`${this.state.cell.type.sprite}.png`}
                className="me-2 border"
              />
              <span className="align-bottom">{this.state.cell.type.name}</span>
            </h4>
            <div className="row">
              <div className="col">Position:</div>
              <div className="col">
                {' '}
                {this.state.cell.x} x {this.state.cell.y}
              </div>
            </div>
            {this.state.cell.maxHp > 0 && (
              <div className="row">
                <div className="col">HP:</div>
                <div className="col">
                  {this.state.cell.hp} / {this.state.cell.maxHp}
                </div>
              </div>
            )}
          </div>
        )}
      </Wrapper>
    );
  }
}
