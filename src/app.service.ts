import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): Record<string, string> {
    return {
      message: 'Alanis Backend API is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
