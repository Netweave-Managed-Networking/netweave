import {
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MatchingRunDTO, MatchingRunListItemDTO } from '@netweave/api-types';
import { AuthGuard } from '../auth/auth.guard';
import { MatchingsService } from './matchings.service';

@Controller('matchings')
@UseGuards(AuthGuard)
export class MatchingsController {
  public constructor(private readonly matchingsService: MatchingsService) {}

  /**
   * starts calculating all matchings in the background, independent of the cron schedule and even if
   * nothing changed; returns as soon as the run is created, well before it finishes, see runs/:id
   */
  @Post('runs')
  @HttpCode(HttpStatus.ACCEPTED)
  public async run(): Promise<MatchingRunDTO> {
    const run = await this.matchingsService.triggerRun();
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

  /** the newest run whatever its status, so a client can tell a run is still in progress right after loading the page */
  @Get('runs/newest')
  public async getNewest(): Promise<MatchingRunDTO> {
    const run = await this.matchingsService.getNewestRun();
    if (!run) {
      throw new NotFoundException('No matching run found');
    }
    return run;
  }

  /** a single run, for polling one that was just started until it finishes or fails */
  @Get('runs/:id')
  public async getRun(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MatchingRunDTO> {
    const run = await this.matchingsService.getRun(id);
    if (!run) {
      throw new NotFoundException('No matching run found');
    }
    return run;
  }

  /** history of past runs, newest first */
  @Get('runs')
  public async getHistory(): Promise<MatchingRunListItemDTO[]> {
    return this.matchingsService.getRunHistory();
  }
}
