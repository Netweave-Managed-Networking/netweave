import { Controller, Get } from '@nestjs/common';
import { WelcomeResponseDTO } from '@netweave/api-types';
import { AppService } from './app.service';

@Controller()
export class AppController {
  public constructor(private readonly appService: AppService) {}

  @Get()
  public getData(): WelcomeResponseDTO {
    return this.appService.getData();
  }
}
