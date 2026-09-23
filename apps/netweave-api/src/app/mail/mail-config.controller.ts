import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import {
  MailConfigDTO,
  MailConfigTestDTO,
  MailConfigUpdateDTO,
  UserAuthDTO,
} from '@netweave/api-types';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { Me } from '../auth/me.decorator';
import { MailConfigService } from './mail-config.service';
import { MailService } from './mail.service';

@Controller('mail-config')
@UseGuards(AuthGuard, AdminGuard)
export class MailConfigController {
  public constructor(
    private readonly mailConfigService: MailConfigService,
    private readonly maiService: MailService,
  ) {}

  @Get('')
  public async get(): Promise<MailConfigDTO> {
    return this.mailConfigService.get();
  }

  @Put('')
  public async update(
    @Me() { user }: UserAuthDTO,
    @Body() mailConfigUpdateDTO: MailConfigUpdateDTO,
  ): Promise<MailConfigDTO> {
    return this.mailConfigService.update(mailConfigUpdateDTO, user.id);
  }

  @Post('test')
  public async test(
    @Body() { to }: MailConfigTestDTO,
  ): Promise<{ success: boolean }> {
    return { success: await this.maiService.sendTestMail(to) };
  }
}
