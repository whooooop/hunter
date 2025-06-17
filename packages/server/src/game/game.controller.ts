import { Controller, Get, Param, Post, Query } from "@nestjs/common";
import { GameGateway } from "./game.gateway";

@Controller('game')
export class GameController {
  constructor(private readonly gameGateway: GameGateway) { }

  @Post()
  async createGame(
    @Query('players') players: number = 2,
  ) {
    const code = await this.gameGateway.createGame({
      players
    });
    return {
      code,
      players
    };
  }

  @Get('/special')
  async createGameSpecial(
    @Query('players') players: number = 2,
  ) {
    const code = await this.gameGateway.createGame({
      players
    });
    return {
      code,
      players
    };
  }

  @Get('/check/:code')
  async checkGame(
    @Param('code') code: string,
  ) {
    const result = await this.gameGateway.hasGame(code);
    return {
      result
    };
  }
}