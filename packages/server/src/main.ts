import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GameGateway } from './game/game.gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(3434, '0.0.0.0');

  try {
    const gameGateway = app.get(GameGateway);
    const httpServer = app.getHttpServer();
    gameGateway.initializeServer(httpServer);
  } catch (error) {
    console.error('Failed to initialize WebSocket server:', error);
  }
}

bootstrap();
