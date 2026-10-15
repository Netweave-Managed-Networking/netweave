import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsModule } from '../invitations/invitations.module';
import { MailModule } from '../mail/mail.module';
import {
  createLanguageModel,
  readLlmConfig,
} from '../matchings/llm/llm-config';
import { MemberCultureWeight } from './member-culture-weight.entity';
import { MemberResourceRequirement } from './member-resource-requirement.entity';
import { Member } from './member.entity';
import { MemberController } from './members.controller';
import { MembersService } from './members.service';
import {
  REQUIREMENTS_GENERATOR,
  RequirementsGenerator,
} from './requirements-generation/requirements-generator';

/** null without LLM_PROVIDER, then requirements cannot be generated */
const createRequirementsGenerator = (): RequirementsGenerator | null => {
  const config = readLlmConfig(process.env);
  if (!config) {
    new Logger('RequirementsGenerator').warn(
      'No LLM_PROVIDER configured, requirements cannot be generated from a project description',
    );
    return null;
  }
  return new RequirementsGenerator(createLanguageModel(config), config);
};

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      MemberCultureWeight,
      MemberResourceRequirement,
    ]),
    InvitationsModule,
    MailModule,
  ],
  controllers: [MemberController],
  providers: [
    MembersService,
    {
      provide: REQUIREMENTS_GENERATOR,
      useFactory: createRequirementsGenerator,
    },
  ],
  exports: [MembersService],
})
export class MembersModule {}
