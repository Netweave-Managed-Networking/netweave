import { Controller, Get } from '@nestjs/common';

/**
 * only purpose of HealthCheckController is to check whether api is currently up and running
 */
@Controller()
export class HealthCheckController {
  @Get('')
  public async healthCheck(): Promise<'healthy'> {
    return 'healthy';
  }
}
