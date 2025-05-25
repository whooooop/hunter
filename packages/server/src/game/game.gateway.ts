import { ClientSocket, MultiplayerServer } from '@hunter/multiplayer/dist/server';
import { ConnectionState, PlayerState } from '@hunter/storage-proto';
import { GameState } from '@hunter/storage-proto/dist/storage';
import { Injectable, Logger } from '@nestjs/common';
import { Server as HttpServer, IncomingMessage } from 'http';
import { parse } from 'url';
import { connectionStateCollection } from './collections/connectionState.collection';
import { enemyStateCollection } from './collections/enemyState.collection';
import { gameStateCollection } from './collections/gameState.collection';
import { playerScoreStateCollection } from './collections/playerScoreState.collection';
import { playerStateCollection } from './collections/playerState.collection';
import { playerWeaponCollection } from './collections/playerWeapon.collection';
import { weaponStateCollection } from './collections/weaponState.collection';
import { gameStorage } from './game.storage';

type SessionData = {
  playerId: string;
}

@Injectable()
export class GameGateway {
  private readonly logger = new Logger(GameGateway.name);
  private multiplayerServer: MultiplayerServer<SessionData>;

  constructor() {
    this.multiplayerServer = new MultiplayerServer<SessionData>({
      pathname: /^\/game\/$/,
      onConnection: this.onConnection,
      onJoin: this.onJoin,
      onDisconnect: this.onDisconnect,
      namespace: {
        timeout: 60000,
        storageId: gameStorage
      }
    });
  }

  initializeServer(httpServer: HttpServer) {
    this.multiplayerServer.initializeWebSocketServer(httpServer);
  }

  async onConnection(server: MultiplayerServer, socket: ClientSocket<SessionData>, namespaceId: string, request: IncomingMessage) {
    const { pathname, query } = parse(request.url || '', true);
    const playerId = query?.playerId as string;
    const gameId = namespaceId;

    if (!playerId) {
      throw new Error(`Upgrade request rejected for game ${gameId}: Missing or invalid playerId query parameter.`);
    }

    socket.session.playerId = playerId;

    const namespace = await server.getNamespace(namespaceId);
    const connections = namespace.getConnections();
    for (const connection of connections) {
      if (connection.session?.playerId === playerId) {
        await connection.disconnect();
      }
    }

    if (namespace.getConnectionsSize() >= 2) {
      throw new Error(`Game ${gameId} is full.`);
    }

    if (namespace.getConnectionsSize() === 0) {
      const gameState = namespace.getCollection<GameState>(gameStateCollection)!;
      gameState.addItem('game', {
        host: playerId,
        playersCount: 2,
        started: false,
        createdAt: Date.now().toString(),
      });
    }
  }

  private async onJoin(server: MultiplayerServer, clientSocket: ClientSocket<SessionData>) {
    const connections = clientSocket.getCollection<ConnectionState>(connectionStateCollection)!;
    const players = clientSocket.getCollection<PlayerState>(playerStateCollection)!;
    const player = players.getItem(clientSocket.session.playerId);

    connections.addItem(clientSocket.session.playerId, { ready: false });

    if (!player) {
      players.addItem(clientSocket.session.playerId, {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
      });
    }

    clientSocket.namespace!.broadcastCollection(clientSocket.id, connectionStateCollection);
    clientSocket.namespace!.broadcastCollection(clientSocket.id, weaponStateCollection);
    clientSocket.namespace!.broadcastCollection(clientSocket.id, enemyStateCollection);
    clientSocket.namespace!.broadcastCollection(clientSocket.id, playerStateCollection);
    clientSocket.namespace!.broadcastCollection(clientSocket.id, playerWeaponCollection);
    clientSocket.namespace!.broadcastCollection(clientSocket.id, playerScoreStateCollection);
    clientSocket.namespace!.broadcastCollection(clientSocket.id, gameStateCollection);
  }

  private async onDisconnect(server: MultiplayerServer<SessionData>, clientSocket: ClientSocket<SessionData>) {
    const connections = clientSocket.getCollection<ConnectionState>(connectionStateCollection)!;
    connections.removeItem(clientSocket.session.playerId);
  }

}
