import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { lastValueFrom } from 'rxjs';

export type DummyQuoteDTO = { id: number; quote: string; author: string };
export type LogEntry = {
  timestamp: string;
  status: number;
  callCount: number;
  data: DummyQuoteDTO;
};
@Injectable()
export class FetchService {
  private readonly logger = new Logger(FetchService.name);
  private readonly apiUrl = 'https://dummyjson.com/quotes/random';
  private callCount = 0;

  constructor(private readonly httpService: HttpService) {
    this.logger.log(`FetchService initialized: api_url=${this.apiUrl}`);
  }

  @Cron(process.env.CRON_SCHEDULE_API_FETCH)
  public async handleCron() {
    try {
      const { data, status } = await this.fetchDummyJson();
      const callCount = ++this.callCount;
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        status,
        callCount,
        data,
      };
      await this.writeToFile(entry);
      this.logger.log(`[${this.callCount}] API response saved successfully`);
    } catch (err: unknown) {
      const e = err as unknown as { message: string; stack: object };
      this.logger.error(
        `failed to fetch from ${this.apiUrl}: ${e?.message || JSON.stringify(e)}`,
        e?.stack,
      );
    }
  }

  private fetchDummyJson(): Promise<{ data: DummyQuoteDTO; status: number }> {
    return lastValueFrom(
      this.httpService.get<DummyQuoteDTO>(this.apiUrl, { timeout: 10000 }),
    );
  }

  private writeToFile(data: LogEntry) {
    const filePath = join('./response-log.txt');
    // create file if not exists, otherwise append to it
    return writeFile(filePath, JSON.stringify(data) + '\n', { flag: 'a' });
  }
}
