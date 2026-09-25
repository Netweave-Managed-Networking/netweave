import {
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MatchingRunDTO } from '@netweave/api-types';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { MatchingsService } from './matchings.service';

@Controller('matchings')
@UseGuards(AuthGuard, AdminGuard)
export class MatchingsController {
  public constructor(private readonly matchingsService: MatchingsService) {}

  /** calculates all matchings right away, independent of the cron schedule and even if nothing changed */
  @Post('runs')
  public async calculate(): Promise<MatchingRunDTO> {
    const run = await this.matchingsService.calculateAll({ force: true });
    if (!run) {
      throw new ConflictException('A matching run is already in progress');
    }
    return run;
  }

  @Get('runs/latest')
  public async getLatest(): Promise<MatchingRunDTO> {
    const run = await this.matchingsService.getLatestRun();
    if (!run) {
      throw new NotFoundException('No matching run found');
    }
    return run;
  }
}
