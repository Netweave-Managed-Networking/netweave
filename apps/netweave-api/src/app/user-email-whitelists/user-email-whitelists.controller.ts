import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  UserAuthDTO,
  UserEmailWhitelistCreateDTO,
  UserEmailWhitelistDTO,
} from '@netweave/api-types';
import { AuthGuard } from '../auth/auth.guard';
import { Me } from '../auth/me.decorator';
import { UserEmailWhitelistsService } from './user-email-whitelists.service';

@Controller('user-email-whitelists')
export class UserEmailWhitelistsController {
  public constructor(
    private readonly userEmailWhitelistsService: UserEmailWhitelistsService,
  ) {}

  @Get('')
  public async all(): Promise<UserEmailWhitelistDTO[] | null> {
    return await this.userEmailWhitelistsService.all();
  }

  @UseGuards(AuthGuard)
  @Post('')
  public async create(
    @Me() { user }: UserAuthDTO,
    @Body() userEmailWhitelistDTO: UserEmailWhitelistCreateDTO,
  ): Promise<UserEmailWhitelistDTO | null> {
    return await this.userEmailWhitelistsService.save(
      userEmailWhitelistDTO,
      user.id,
    );
  }
}
