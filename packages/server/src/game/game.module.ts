import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';

@Module({
  providers: [GameGateway],
  controllers: [GameController]
})
export class GameModule { }
