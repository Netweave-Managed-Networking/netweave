import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  LlmConfigDTO,
  LlmConfigTestResultDTO,
  LlmConfigUpdateDTO,
  UserAuthDTO,
} from '@netweave/api-types';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { Me } from '../auth/me.decorator';
import { LlmConfigService } from './llm-config.service';

@Controller('llm-config')
@UseGuards(AuthGuard, AdminGuard)
export class LlmConfigController {
  public constructor(private readonly llmConfigService: LlmConfigService) {}

  @Get('')
  public async get(): Promise<LlmConfigDTO> {
    return this.llmConfigService.get();
  }

  @Put('')
  public async update(
    @Me() { user }: UserAuthDTO,
    @Body() llmConfigUpdateDTO: LlmConfigUpdateDTO,
  ): Promise<LlmConfigDTO> {
    return this.llmConfigService.update(llmConfigUpdateDTO, user.id);
  }

  @Delete('')
  public async remove(@Me() { user }: UserAuthDTO): Promise<LlmConfigDTO> {
    return this.llmConfigService.remove(user.id);
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  public async test(
    @Body() llmConfigUpdateDTO: LlmConfigUpdateDTO,
  ): Promise<LlmConfigTestResultDTO> {
    return this.llmConfigService.test(llmConfigUpdateDTO);
  }
}
