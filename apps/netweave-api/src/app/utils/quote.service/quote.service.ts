import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

export type QuoteDTO = { id: number; quote: string; author: string };

export type QuoteResponse = {
  meta: { timestamp: string; status: number; callCount: number };
  quote: QuoteDTO;
};

@Injectable()
export class QuoteService {
  private readonly logger = new Logger(QuoteService.name);
  private readonly apiUrl = 'https://dummyjson.com/quotes/random';
  private callCount = 0;

  constructor(private readonly httpService: HttpService) {
    this.logger.log(`FetchService initialized: api_url=${this.apiUrl}`);
  }

  public async getQuote(): Promise<QuoteResponse | undefined> {
    try {
      const { data, status } = await this.fetchDummyJson();
      const callCount = ++this.callCount;
      this.logger.log(`[${this.callCount}] API response received successfully`);
      return {
        meta: { timestamp: new Date().toISOString(), status, callCount },
        quote: data,
      };
    } catch (err: unknown) {
      const e = err as unknown as { message: string; stack: object };
      this.logger.error(
        `failed to fetch from ${this.apiUrl}: ${e?.message || JSON.stringify(e)}`,
        e?.stack,
      );
      return undefined;
    }
  }

  private fetchDummyJson(): Promise<{ data: QuoteDTO; status: number }> {
    return lastValueFrom(
      this.httpService.get<QuoteDTO>(this.apiUrl, { timeout: 10000 }),
    );
  }
}
