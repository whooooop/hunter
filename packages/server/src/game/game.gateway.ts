import { ClientSocket, MultiplayerServer } from '@hunter/multiplayer/dist/server';
import { ConnectionState, PlayerState } from '@hunter/storage-proto';
import { GameState, PlayerSkin } from '@hunter/storage-proto/dist/storage';
import { Injectable, Logger } from '@nestjs/common';
import { Server as HttpServer, IncomingMessage } from 'http';
import * as ms from 'ms';
import { Rword } from 'rword';
import { words } from 'rword-english-extended';
import { parse } from 'url';
import { connectionStateCollection } from './collections/connectionState.collection';
import { enemyStateCollection } from './collections/enemyState.collection';
import { gameStateCollection } from './collections/gameState.collection';
import { playerScoreStateCollection, playerSkinCollection, playerStateCollection, playerWeaponCollection } from './collections/player.collections';
import { waveStateCollection } from './collections/waveState.collection';
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
        timeout: ms('30m'),
        storageId: gameStorage
      }
    });
  }

  initializeServer(httpServer: HttpServer) {
    this.multiplayerServer.initializeWebSocketServer(httpServer);
  }

  async hasGame(namespaceId: string): Promise<boolean> {
    return this.multiplayerServer.hasNamespace(namespaceId);
  }

  async createGame(): Promise<string> {
    const rword = new Rword(words);
    const namespaceId = rword.generate(1)[0].toLowerCase();
    const hasGame = await this.hasGame(namespaceId);

    if (hasGame) {
      return this.createGame();
    }

    await this.multiplayerServer.createNamespace(namespaceId);

    return namespaceId;
  }

  async onConnection(server: MultiplayerServer, socket: ClientSocket<SessionData>, namespaceId: string, request: IncomingMessage) {
    const { pathname, query } = parse(request.url || '', true);
    const playerId = query?.playerId as string;
    const gameId = namespaceId;

    if (gameId.length > 10) {
      throw new Error(`Upgrade request rejected for game ${gameId}: Game id is too long.`);
    }

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

    if (namespace.getConnectionsSize() === 0) {
      const gameState = namespace.getCollection<GameState>(gameStateCollection)!;
      gameState.updateItem('game', {
        host: playerId,
        levelId: 'forest',
        playersCount: 2,
        paused: false,
        started: false,
        finished: false,
        createdAt: Date.now().toString(),
      });
    }

    const gameState = namespace.getCollection<GameState>(gameStateCollection)!;
    const game = gameState.getItem('game')!;
    if (namespace.getConnectionsSize() >= game.playersCount) {
      throw new Error(`Game ${gameId} is full.`);
    }
  }

  private async onJoin(server: MultiplayerServer, clientSocket: ClientSocket<SessionData>) {
    const connections = clientSocket.getCollection<ConnectionState>(connectionStateCollection)!;
    const playersState = clientSocket.getCollection<PlayerState>(playerStateCollection)!;
    const playersSkin = clientSocket.getCollection<PlayerSkin>(playerSkinCollection)!;
    const player = playersState.getItem(clientSocket.session.playerId);
    const availableBodySkins = new Set<string>(['b1', 'b2', 'b3', 'b4', 'b5', 'b6']);

    playersSkin.forEach((record) => availableBodySkins.delete(record.data.body));

    connections.addItem(clientSocket.session.playerId, { ready: false });

    if (!player) {

      playersSkin.addItem(clientSocket.session.playerId, {
        body: Array.from(availableBodySkins)[Math.floor(Math.random() * availableBodySkins.size)],
      });
      playersState.addItem(clientSocket.session.playerId, {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
      });
    }

    clientSocket.namespace!.sendCollections(clientSocket.id, [
      connectionStateCollection,
      weaponStateCollection,
      enemyStateCollection,
      playerSkinCollection,
      playerStateCollection,
      playerScoreStateCollection,
      playerWeaponCollection,
      waveStateCollection,
      gameStateCollection,
    ]);
  }

  private async onDisconnect(server: MultiplayerServer<SessionData>, clientSocket: ClientSocket<SessionData>) {
    const connections = clientSocket.getCollection<ConnectionState>(connectionStateCollection)!;
    connections.removeItem(clientSocket.session.playerId);
  }

}
