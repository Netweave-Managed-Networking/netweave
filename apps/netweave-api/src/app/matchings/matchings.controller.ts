import {
  ConflictException,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  MatchingRunDTO,
  MatchingRunListItemDTO,
  PaginatedDTO,
} from '@netweave/api-types';
import { AuthGuard } from '../auth/auth.guard';
import { MatchingsService } from './matchings.service';

const DEFAULT_HISTORY_PAGE_SIZE = 20;

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

  /**
   * cancels a run that is still calculating; it stops right away or, if it runs in another api instance,
   * within one heartbeat. matchings calculated up to then are kept.
   */
  @Post('runs/:id/cancel')
  @HttpCode(HttpStatus.OK)
  public async cancel(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MatchingRunDTO> {
    const run = await this.matchingsService.cancelRun(id);
    if (!run) {
      throw new NotFoundException('No matching run found');
    }
    if (!run.cancelledAt) {
      throw new ConflictException('The matching run is no longer in progress');
    }
    return run;
  }

  /** history of past runs, newest first, paginated */
  @Get('runs')
  public async getHistory(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(DEFAULT_HISTORY_PAGE_SIZE),
      ParseIntPipe,
    )
    pageSize: number,
  ): Promise<PaginatedDTO<MatchingRunListItemDTO>> {
    return this.matchingsService.getRunHistory(page, pageSize);
  }
}
