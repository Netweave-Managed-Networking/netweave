import { Injectable } from '@nestjs/common';
import { WelcomeResponseDTO } from '@netweave/api-types';

@Injectable()
export class AppService {
  getData(): WelcomeResponseDTO {
    return { message: 'Hello from API' };
  }
}
