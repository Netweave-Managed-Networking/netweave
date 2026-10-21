import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserAuthDTO, UserDTO, UserRoleUpdateDTO } from '@netweave/api-types';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { Me } from '../auth/me.decorator';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard, AdminGuard)
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Get('')
  public async all(): Promise<UserDTO[]> {
    return await this.usersService.all();
  }

  @Patch(':id/role')
  public async updateRole(
    @Me() { user }: UserAuthDTO,
    @Param('id', ParseIntPipe) id: number,
    @Body() { role }: UserRoleUpdateDTO,
  ): Promise<UserDTO> {
    return await this.usersService.updateRole(id, role, user.id);
  }

  @Delete(':id')
  public async remove(
    @Me() { user }: UserAuthDTO,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<true> {
    return await this.usersService.remove(id, user.id);
  }
}
