import { Controller, Get, Param, Post } from "@nestjs/common";
import { GameGateway } from "./game.gateway";

@Controller('game')
export class GameController {
  constructor(private readonly gameGateway: GameGateway) { }

  @Post()
  async createGame() {
    const code = await this.gameGateway.createGame();
    return {
      code
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