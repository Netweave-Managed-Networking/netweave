import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export const PROJECT_DESCRIPTION_MAX_LENGTH = 5000;

/** only used to generate requirements, never stored */
export class MemberRequirementsGenerationDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(PROJECT_DESCRIPTION_MAX_LENGTH)
  declare public projectDescription: string;
}
