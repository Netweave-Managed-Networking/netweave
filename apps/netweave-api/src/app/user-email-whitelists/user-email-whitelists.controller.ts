import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  UserAuthDTO,
  UserEmailWhitelistCreateDTO,
  UserEmailWhitelistDTO,
} from '@netweave/api-types';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { Me } from '../auth/me.decorator';
import { UserEmailWhitelistsService } from './user-email-whitelists.service';

@Controller('user-email-whitelists')
@UseGuards(AuthGuard, AdminGuard)
export class UserEmailWhitelistsController {
  public constructor(
    private readonly userEmailWhitelistsService: UserEmailWhitelistsService,
  ) {}

  @Get('')
  public async all(): Promise<UserEmailWhitelistDTO[] | null> {
    return await this.userEmailWhitelistsService.all();
  }

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

  @Delete(':id')
  public async delete(@Param() { id }: { id: string }): Promise<true> {
    return await this.userEmailWhitelistsService.remove(Number(id));
  }
}
