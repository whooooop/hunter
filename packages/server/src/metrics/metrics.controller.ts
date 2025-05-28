import { registry } from "@hunter/multiplayer/dist/metrics";
import { Controller, Get, Header, Headers, UnauthorizedException } from "@nestjs/common";
import { collectDefaultMetrics, register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
  constructor() {
    collectDefaultMetrics({ register, prefix: 'hunter_server_' });
  }

  @Get()
  @Header('content-type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(
    @Headers('x-metrics-access') accessToken: string,
  ): Promise<string> {
    console.log('accessToken', accessToken);
    console.log('process.env.METRICS_ACCESS_TOKEN', process.env.METRICS_ACCESS_TOKEN);
    if (accessToken !== process.env.METRICS_ACCESS_TOKEN) {
      throw new UnauthorizedException('Forbidden');
    }

    const systemMetrics = await register.metrics();
    const multiplayerMetrics = await registry.metrics();
    return systemMetrics + '\n' + multiplayerMetrics;
  }
}