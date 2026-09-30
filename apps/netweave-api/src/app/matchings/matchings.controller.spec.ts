import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MatchingRunDTO } from '@netweave/api-types';
import { AuthGuard } from '../auth/auth.guard';
import { MatchingsController } from './matchings.controller';
import { MatchingsService } from './matchings.service';

const createdAt = new Date('2026-09-25T10:00:00Z');

const mockRun: MatchingRunDTO = {
  id: 3,
  createdAt,
  updatedAt: createdAt,
  finishedAt: createdAt,
  failedAt: null,
  matchingCount: 6,
};

describe('MatchingsController', () => {
  let controller: MatchingsController;
  let matchingsService: Partial<
    Record<
      | 'triggerRun'
      | 'getLatestRun'
      | 'getNewestRun'
      | 'getRun'
      | 'getRunHistory',
      jest.Mock
    >
  >;

  beforeEach(async () => {
    matchingsService = {
      triggerRun: jest.fn().mockResolvedValue(mockRun),
      getLatestRun: jest.fn().mockResolvedValue(mockRun),
      getNewestRun: jest.fn().mockResolvedValue(mockRun),
      getRun: jest.fn().mockResolvedValue(mockRun),
      getRunHistory: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchingsController],
      providers: [{ provide: MatchingsService, useValue: matchingsService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<MatchingsController>(MatchingsController);
  });

  describe('run', () => {
    it('starts a run and returns its (still empty) summary', async () => {
      expect(await controller.run()).toEqual(mockRun);
      expect(matchingsService.triggerRun).toHaveBeenCalledWith();
    });

    it('throws a conflict when a run is already in progress', async () => {
      matchingsService.triggerRun?.mockResolvedValue(null);

      await expect(controller.run()).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('getLatest', () => {
    it('returns the summary of the latest run', async () => {
      expect(await controller.getLatest()).toEqual(mockRun);
    });

    it('throws not found when no run exists yet', async () => {
      matchingsService.getLatestRun?.mockResolvedValue(null);

      await expect(controller.getLatest()).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getNewest', () => {
    it('returns the summary of the newest run', async () => {
      expect(await controller.getNewest()).toEqual(mockRun);
    });

    it('throws not found when no run exists yet', async () => {
      matchingsService.getNewestRun?.mockResolvedValue(null);

      await expect(controller.getNewest()).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getRun', () => {
    it('returns the summary of a single run', async () => {
      expect(await controller.getRun(3)).toEqual(mockRun);
      expect(matchingsService.getRun).toHaveBeenCalledWith(3);
    });

    it('throws not found when no run exists with that id', async () => {
      matchingsService.getRun?.mockResolvedValue(null);

      await expect(controller.getRun(3)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getHistory', () => {
    it('returns a page of run history', async () => {
      const history = {
        items: [
          {
            id: 3,
            createdAt,
            finishedAt: createdAt,
            failedAt: null,
            matchingCount: 6,
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
      };
      matchingsService.getRunHistory?.mockResolvedValue(history);

      expect(await controller.getHistory(1, 20)).toEqual(history);
      expect(matchingsService.getRunHistory).toHaveBeenCalledWith(1, 20);
    });
  });
});
