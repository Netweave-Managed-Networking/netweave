import * as dotenv from 'dotenv';
import * as path from 'path';

// own module, so it can be imported before anything else: imports are hoisted, and decorators like @Cron read process.env when their module is loaded
const envFile = process.env.NODE_ENV === 'e2e.api' ? '.env.e2e.api' : '.env';
dotenv.config({
  path: path.resolve(__dirname, '../../..', envFile),
  override: process.env.NODE_ENV === 'e2e.api',
});
