import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsService } from '../../events/events.service';
import { ProjectEventListener } from '../../events/listeners/project.listener';
import { InvoiceNinjaModule } from '../../integrations/invoice-ninja/invoice-ninja.module';
import { N8nModule } from '../../integrations/n8n/n8n.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    InvoiceNinjaModule,
    N8nModule,
    PrismaModule,
  ],
  providers: [EventsService, ProjectEventListener],
  exports: [EventsService],
})
export class EventsModule {}
