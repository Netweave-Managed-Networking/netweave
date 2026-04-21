import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';

@Module({
  imports: [HttpModule],
  providers: [QuoteService],
  exports: [QuoteService],
})
export class QuoteModule {}
