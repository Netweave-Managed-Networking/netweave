import { HttpModule, HttpService } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import * as fs from 'fs/promises';
import { of } from 'rxjs';
import { DummyQuoteDTO, FetchService } from './fetch.service';

jest.mock('fs/promises');

describe('FetchService', () => {
  let service: FetchService;
  let httpService: HttpService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [FetchService],
    }).compile();

    service = module.get(FetchService);
    httpService = module.get(HttpService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('logs response to file and increments call count', async () => {
    const dummy: DummyQuoteDTO = { id: 1, quote: 'Hello, World!', author: 'John Doe' };
    jest.spyOn(httpService, 'get').mockReturnValue(
      of({
        data: dummy,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      } as AxiosResponse<DummyQuoteDTO>),
    );
    const writeSpy = jest
      .spyOn(fs, 'writeFile')
      .mockResolvedValue(undefined);

    await service.handleCron();

    expect(writeSpy).toHaveBeenCalled();
    const [filePath, contents, opts] = writeSpy.mock.calls[0];
    expect(filePath).toContain('response-log.json');
    // ensure data, status code, and timestamp are written
    expect(contents).toContain('"id":1');
    expect(contents).toContain('"quote":"Hello, World!"');
    expect(contents).toContain('"author":"John Doe"');
    expect(contents).toContain('"status":200');
    expect(contents).toContain('"callCount":1');
    expect(contents).toMatch(/"timestamp":"[^"]+"/);
    expect(opts).toEqual({ flag: 'a' });
  });

  it('handles fetch errors gracefully', async () => {
    const error = new Error('Network error');
    jest.spyOn(httpService, 'get').mockImplementation(() => {
      throw error;
    });

    await expect(service.handleCron()).resolves.not.toThrow();
  });
});
