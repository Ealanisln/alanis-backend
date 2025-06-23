import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { InvoiceNinjaService } from './invoice-ninja.service';

@Module({
  imports: [ConfigModule, HttpModule, PrismaModule],
  providers: [InvoiceNinjaService],
  exports: [InvoiceNinjaService],
})
export class InvoiceNinjaModule {}
