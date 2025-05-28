import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GameGateway } from './game/game.gateway';

async function bootstrap() {
  const port = process.env.PORT || 3434;
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');

  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Server is running on port ${port}`);
  });

  try {
    const gameGateway = app.get(GameGateway);
    const httpServer = app.getHttpServer();
    gameGateway.initializeServer(httpServer);
  } catch (error) {
    console.error('Failed to initialize WebSocket server:', error);
  }
}

bootstrap();
