import { Module } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { TimeTrackingController } from './time-tracking.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { EventsModule } from '../common/events/events.module';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [TimeTrackingController],
  providers: [TimeTrackingService],
  exports: [TimeTrackingService],
})
export class TimeTrackingModule {}
