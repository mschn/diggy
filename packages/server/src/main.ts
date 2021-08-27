import {
  ClientCommandType,
  Command,
  Engine,
  MoveLeftCommand,
  MoveRightCommand,
  PlayersCommand,
  ServerCommandType,
  STATIC_MAP
} from 'diggy-shared';
import { Server } from 'ws';
import WebSocket = require('ws');

export class Main {
  engine: Engine;
  wss: Server;
  updateClients = false;

  public start(): void {
    let i = 0;

    this.engine = new Engine();
    this.engine.onTick = () => this.update();
    this.engine.loadMap(STATIC_MAP);
    this.engine.start();

    this.wss = new Server({ port: 8080, path: '/game' });
    this.wss.on('connection', (ws) => {
      const name = `Player_${i++}`;
      this.engine.spawnPlayer(name);
      this.updateClients = true;

      ws.send(
        JSON.stringify({
          type: ServerCommandType.LOGGED_IN,
          user: name
        })
      );

      ws.send(
        JSON.stringify({
          type: ServerCommandType.MAP,
          map: this.engine.map.toString()
        })
      );

      ws.on('message', (message) => {
        const cmd = JSON.parse(message.toString()) as Command;
        console.log(`Received command ${cmd.type}`);
        this.updateClients = true;

        if (cmd.type === ClientCommandType.MOVE_LEFT) {
          const moveLeftCmd = cmd as MoveLeftCommand;
          this.engine.getPlayer(name).moveLeft(moveLeftCmd.start);
          console.log('move left', message.toString());
        }
        if (cmd.type === ClientCommandType.MOVE_RIGHT) {
          const moveRightCmd = cmd as MoveRightCommand;
          this.engine.getPlayer(name).moveRight(moveRightCmd.start);
          console.log('move right', message.toString());
        }
        if (cmd.type === ClientCommandType.JUMP) {
          this.engine.getPlayer(name).jump();
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

    const cmd: PlayersCommand = {
      type: ServerCommandType.PLAYERS,
      players: this.engine.players
    };
    const json = JSON.stringify(cmd);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(json);
      }
    });
  }
}

new Main().start();
