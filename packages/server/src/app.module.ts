import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    GameModule,
    MetricsModule,
  ],
})
export class AppModule { }
