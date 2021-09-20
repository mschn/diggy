// used by tsyringe for dependency injection
import 'reflect-metadata';

import {
  ClientCommandType,
  Command,
  Engine,
  GameState,
  Map,
  Player,
  PlayerOrientation,
  ServerCommandType,
  STATIC_MAP
} from 'diggy-shared';
import { container, singleton } from 'tsyringe';
import { Server } from 'ws';

import WebSocket = require('ws');

@singleton()
export class DiggyServer {
  private wss: Server;
  private updateClients = false;

  private map: Map;
  private players: Player[];

  constructor(
    private readonly engine: Engine,
    private readonly state: GameState
  ) {
    this.state.getMap().subscribe((map) => (this.map = map));
    this.state.getPlayers().subscribe((players) => (this.players = players));
    this.state.onCell().subscribe((cell) => {
      this.broadcast({
        type: ServerCommandType.CELL,
        payload: cell.toString()
      });
    });
  }

  public start(): void {
    let i = 0;

    this.state.onTick().subscribe(() => this.update());
    this.state.loadMap(STATIC_MAP);
    this.engine.start();

    this.wss = new Server({ port: 8080, path: '/game' });
    this.wss.on('connection', (ws) => {
      const name = `Player_${i++}`;
      this.engine.spawnPlayer(name);
      this.updateClients = true;

      this.send(ws, {
        type: ServerCommandType.LOGGED_IN,
        payload: name
      });
      this.send(ws, {
        type: ServerCommandType.MAP,
        payload: this.map.toString()
      });

      ws.on('message', (message) => {
        const cmd = JSON.parse(message.toString()) as Command;
        const player = this.engine.getPlayer(name);
        console.log(`Received command ${cmd.type} : ${cmd.payload}`);
        this.updateClients = true;

        // MOVE LEFT
        if (cmd.type === ClientCommandType.MOVE_LEFT) {
          player.moveLeft(cmd.payload === '1');
          console.log('move left', message.toString());
        }
        // MOVE RIGHT
        if (cmd.type === ClientCommandType.MOVE_RIGHT) {
          player.moveRight(cmd.payload === '1');
          console.log('move right', message.toString());
        }
        // JUMP
        if (cmd.type === ClientCommandType.JUMP) {
          player.jump();
        }
        // LOOK
        if (cmd.type === ClientCommandType.LOOK) {
          const coords = cmd.payload.split(',');
          const x = Number.parseInt(coords[0]);
          const y = Number.parseInt(coords[1]);
          player.lookX = x;
          player.lookY = y;
          const pcell = this.map.getCell(player.x, player.y);
          player.orientation =
            x < pcell.x ? PlayerOrientation.LEFT : PlayerOrientation.RIGHT;
        }

        // ATTACK
        if (cmd.type === ClientCommandType.ATTACK) {
          player.attacking = cmd.payload === '1';
        }
      });

      ws.on('close', () => {
        this.engine.removePlayer(name);
        this.updateClients = true;
      });
    });
  }

  update(): void {
    if (!this.updateClients) {
      return;
    } else {
      this.updateClients = false;
    }
    this.broadcast({
      type: ServerCommandType.PLAYERS,
      payload: this.players.map((p) => p.toString()).join('\n')
    });
  }

  send(ws: WebSocket, command: Command): void {
    ws.send(JSON.stringify(command));
  }

  broadcast(command: Command): void {
    const json = JSON.stringify(command);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(json);
      }
    });
  }
}

const server = container.resolve(DiggyServer);
server.start();
// new Main().start();
