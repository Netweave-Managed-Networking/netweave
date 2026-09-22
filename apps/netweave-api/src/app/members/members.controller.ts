import { Controller, Get } from '@nestjs/common';
import { MemberDTO } from '@netweave/api-types';
import { MembersService } from './members.service';

@Controller('members')
export class MemberController {
  public constructor(private readonly membersService: MembersService) {}

  @Get('/latest')
  public getLatest(): Promise<MemberDTO | null> {
    return this.membersService.getLatestMember();
  }
}
