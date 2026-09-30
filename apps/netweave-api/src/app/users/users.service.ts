import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDTO, UserRole } from '@netweave/api-types';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  public constructor(
    @InjectRepository(User) private repository: Repository<User>,
  ) {}

  public async all(): Promise<User[]> {
    return await this.repository.find({ order: { email: 'asc' } });
  }

  /**
   * @throws ForbiddenException when an admin tries to change their own role (prevents admin lockout)
   * @throws NotFoundException when no user with the given id exists
   */
  public async updateRole(
    id: UserDTO['id'],
    role: UserRole,
    actingUserId: UserDTO['id'],
  ): Promise<User> {
    if (id === actingUserId)
      throw new ForbiddenException('You cannot change your own role');

    const user = await this.repository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    return await this.repository.save({ ...user, role });
  }

  /**
   * @throws ForbiddenException when an admin tries to remove their own account (prevents admin lockout)
   * @throws NotFoundException when no user with the given id exists
   */
  public async remove(
    id: UserDTO['id'],
    actingUserId: UserDTO['id'],
  ): Promise<true> {
    if (id === actingUserId)
      throw new ForbiddenException('You cannot remove your own account');

    const user = await this.repository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    await this.repository.remove(user);
    return true;
  }
}
