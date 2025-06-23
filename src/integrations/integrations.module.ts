import { Module } from '@nestjs/common';
import { InvoiceNinjaModule } from './invoice-ninja/invoice-ninja.module';
import { N8nModule } from './n8n/n8n.module';
import { IntegrationsController } from './integrations.controller';
import { EventsModule } from '../common/events/events.module';

@Module({
  imports: [InvoiceNinjaModule, N8nModule, EventsModule],
  controllers: [IntegrationsController],
  exports: [InvoiceNinjaModule, N8nModule],
})
export class IntegrationsModule {}
