import { Logger } from '@nestjs/common';
import {
  DEFAULT_UPDATE_REMINDER_INTERVAL,
  readUpdateReminderInterval,
} from './update-reminder-interval';

describe('readUpdateReminderInterval', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('defaults to 6 months when unset or blank', () => {
    expect(DEFAULT_UPDATE_REMINDER_INTERVAL).toBe('6 months');
    expect(readUpdateReminderInterval({})).toBe('6 months');
    expect(
      readUpdateReminderInterval({ MEMBER_UPDATE_REMINDER_INTERVAL: '  ' }),
    ).toBe('6 months');
  });

  it.each(['1 year', '3 months', '2 weeks', '10 days', '5 minutes', '1 hour'])(
    'takes "%s"',
    (interval) => {
      expect(
        readUpdateReminderInterval({
          MEMBER_UPDATE_REMINDER_INTERVAL: interval,
        }),
      ).toBe(interval);
    },
  );

  it('normalizes surrounding and repeated whitespace', () => {
    expect(
      readUpdateReminderInterval({
        MEMBER_UPDATE_REMINDER_INTERVAL: ' 3   months ',
      }),
    ).toBe('3 months');
  });

  it.each(['6', 'months', '0 months', '-1 months', '6 monts', "6 months'; --"])(
    'falls back to the default and warns on "%s"',
    (interval) => {
      expect(
        readUpdateReminderInterval({
          MEMBER_UPDATE_REMINDER_INTERVAL: interval,
        }),
      ).toBe('6 months');
      expect(Logger.prototype.warn).toHaveBeenCalled();
    },
  );
});
