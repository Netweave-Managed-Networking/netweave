import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MatchingRunDTO } from '@netweave/api-types';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { MatchingsController } from './matchings.controller';
import { MatchingsService } from './matchings.service';

const createdAt = new Date('2026-09-25T10:00:00Z');

const mockRun: MatchingRunDTO = {
  id: 3,
  createdAt,
  updatedAt: createdAt,
  matchingCount: 6,
};

describe('MatchingsController', () => {
  let controller: MatchingsController;
  let matchingsService: Partial<
    Record<'calculateAll' | 'getLatestRun', jest.Mock>
  >;

  beforeEach(async () => {
    matchingsService = {
      calculateAll: jest.fn().mockResolvedValue(mockRun),
      getLatestRun: jest.fn().mockResolvedValue(mockRun),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchingsController],
      providers: [{ provide: MatchingsService, useValue: matchingsService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<MatchingsController>(MatchingsController);
  });

  describe('calculate', () => {
    it('forces a run and returns its summary', async () => {
      expect(await controller.calculate()).toEqual(mockRun);
      expect(matchingsService.calculateAll).toHaveBeenCalledWith({
        force: true,
      });
    });

    it('throws a conflict when a run is already in progress', async () => {
      matchingsService.calculateAll?.mockResolvedValue(null);

      await expect(controller.calculate()).rejects.toBeInstanceOf(
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
});
