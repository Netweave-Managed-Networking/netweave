import { Logger } from '@nestjs/common';

export const DEFAULT_UPDATE_REMINDER_INTERVAL = '6 months';

// a deliberately small subset of the postgres interval syntax, so a typo cannot break the query
const INTERVAL_PATTERN = /^[1-9]\d* (minute|hour|day|week|month|year)s?$/;

/** MEMBER_UPDATE_REMINDER_INTERVAL as postgres interval, e.g. "6 months"; falls back to the default when unset or invalid */
export const readUpdateReminderInterval = (
  env: NodeJS.ProcessEnv = process.env,
): string => {
  const interval =
    env.MEMBER_UPDATE_REMINDER_INTERVAL?.trim().replace(/\s+/g, ' ') ||
    DEFAULT_UPDATE_REMINDER_INTERVAL;

  if (!INTERVAL_PATTERN.test(interval)) {
    new Logger('UpdateReminderInterval').warn(
      `Invalid MEMBER_UPDATE_REMINDER_INTERVAL "${interval}", falling back to ${DEFAULT_UPDATE_REMINDER_INTERVAL}`,
    );
    return DEFAULT_UPDATE_REMINDER_INTERVAL;
  }

  return interval;
};
