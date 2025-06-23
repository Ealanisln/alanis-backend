import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { N8nService } from './n8n.service';

@Module({
  imports: [ConfigModule, HttpModule, PrismaModule],
  providers: [N8nService],
  exports: [N8nService],
})
export class N8nModule {}
