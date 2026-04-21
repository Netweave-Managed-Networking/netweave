import { HttpModule, HttpService } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { QuoteDTO, QuoteService } from './quote.service';

describe('QuoteService', () => {
  let service: QuoteService;
  let httpService: HttpService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [QuoteService],
    }).compile();

    service = module.get(QuoteService);
    httpService = module.get(HttpService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns response and increments call count', async () => {
    const dummy: QuoteDTO = {
      id: 1,
      quote: 'Hello, World!',
      author: 'John Doe',
    };

    jest.spyOn(httpService, 'get').mockReturnValue(
      of({
        data: dummy,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse<QuoteDTO>),
    );

    const quote = await service.getQuote();

    // ensure data, status code, and timestamp are written
    expect(quote?.quote.id).toEqual(1);
    expect(quote?.quote.quote).toEqual('Hello, World!');
    expect(quote?.quote.author).toEqual('John Doe');
    expect(quote?.meta.status).toEqual(200);
    expect(quote?.meta.callCount).toEqual(1);
  });

  it('handles fetch errors gracefully', async () => {
    const error = new Error('Network error');
    jest.spyOn(httpService, 'get').mockImplementation(() => {
      throw error;
    });

    await expect(service.getQuote()).resolves.not.toThrow();
  });
});
