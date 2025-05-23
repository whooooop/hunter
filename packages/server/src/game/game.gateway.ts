import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'url';
import { Server as HttpServer, IncomingMessage } from 'http';
import { MultiplayerServer, ClientSocket } from '@hunter/multiplayer/dist/server';
import { playersCollection } from './collections/players.collection';
import { connectionsCollection } from './collections/connections.collection';
import { Connection, Player } from '@hunter/storage-proto';
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

    // Помумать как переименовать, что то типо проверка подключерния, гуарда?
    
    async onConnection(server: MultiplayerServer, socket: ClientSocket<SessionData>, namespaceId: string, request: IncomingMessage) {
        const { pathname, query } = parse(request.url || '', true);
        const playerId = query?.playerId as string;
        const gameId = namespaceId;

        if (!playerId) {
            throw new Error(`Upgrade request rejected for game ${gameId}: Missing or invalid playerId query parameter.`);
        }

        socket.session.playerId = playerId;

        const namespace = server.getNamespace(namespaceId);
        const connections = namespace.getConnections();
        for (const connection of connections) {
            if (connection.session?.playerId === playerId) {
                await connection.disconnect();
            }
        }

        if (namespace.getConnectionsSize() >= 2) {
            throw new Error(`Game ${gameId} is full.`);
        }
    }

    private async onJoin(server: MultiplayerServer<SessionData>, clientSocket: ClientSocket<SessionData>) {
        const connections = clientSocket.getCollection<Connection>(connectionsCollection)!;
        const players = clientSocket.getCollection<Player>(playersCollection)!;
        const player = players.getItem(clientSocket.session.playerId);
        
        connections.addItem(clientSocket.session.playerId, { ready: false });

        if (!player) {
            players.addItem(clientSocket.session.playerId, {
                id: clientSocket.session.playerId,
                position: { x: 0, y: 0 },
                velocity: { x: 0, y: 0 },
                weaponId: 'default',
            });
        }

        // Отправить игроку нужные состояния коллекций
        clientSocket.namespace!.broadcastCollection(clientSocket.id, connectionsCollection);
        clientSocket.namespace!.broadcastCollection(clientSocket.id, playersCollection);
    }

    private async onDisconnect(server: MultiplayerServer<SessionData>, clientSocket: ClientSocket<SessionData>) {
        const connections = clientSocket.getCollection<Connection>(connectionsCollection)!;
        connections.removeItem(clientSocket.session.playerId);
    }

    // private handleFireEvent(ws: WebSocket, gameId: string, playerId: string, clientId: string, data: Uint8Array) {
    //     this.logger.debug(`handleFireEvent`);
    //     this.broadcast(gameId, data, ws);
    // }
    // private handleWaveStart(ws: WebSocket, gameId: string, playerId: string, clientId: string, data: Uint8Array) {
    //     this.logger.debug(`handleWaveStart`);
    //     this.broadcast(gameId, data, ws);
    // }
    // private handleSpawnEnemy(ws: WebSocket, gameId: string, playerId: string, clientId: string, data: Uint8Array) {
    //     this.logger.debug(`handleSpawnEnemy`);
    //     this.broadcast(gameId, data, ws);
    // }
    // private handleEnemyDeath(ws: WebSocket, gameId: string, playerId: string, clientId: string, data: Uint8Array) {
    //     this.logger.debug(`handleEnemyDeath`);
    //     this.broadcast(gameId, data, ws);
    // }
    // private handlePlayerSetWeapon(ws: WebSocket, gameId: string, playerId: string, clientId: string, data: Uint8Array) {
    //     this.logger.debug(`handlePlayerSetWeapon`);
    //     this.broadcast(gameId, data, ws);  
    // }
    // private handleWeaponPurchased(ws: WebSocket, gameId: string, playerId: string, clientId: string, data: Uint8Array) {
    //     this.logger.debug(`handleWeaponPurchased`);
    //     this.broadcast(gameId, data, ws);
    // }
    // private handlePlayerScoreUpdate(ws: WebSocket, gameId: string, playerId: string, clientId: string, data: Uint8Array) {
    //     this.logger.debug(`handlePlayerScoreUpdate`);
    //     this.broadcast(gameId, data, ws);
    // }
    // private handlePlayerPosition(ws: WebSocket, gameId: string, playerId: string, clientId: string, payload: Uint8Array) {
    //     this.logger.debug(`handlePlayerState`);
    //     const data = proto.EventPlayerPosition.decode(payload);
    //     this.gameService.setPlayerPosition(gameId, playerId, data.position!);
    //     this.broadcast(gameId, payload, ws);
    // }

}
