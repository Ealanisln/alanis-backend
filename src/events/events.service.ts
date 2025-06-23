import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { N8nService } from '../integrations/n8n/n8n.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly n8nService: N8nService,
  ) {}

  /**
   * Emitir evento interno y disparar workflow en n8n si es necesario
   */
  async emit(event: string, data: any): Promise<void> {
    try {
      // Emitir evento interno para listeners
      this.eventEmitter.emit(event, data);

      // Log del evento
      this.logger.log(`Event emitted: ${event}`, data);
    } catch (error: any) {
      this.logger.error(`Error emitting event ${event}:`, error.message);
    }
  }

  /**
   * Emitir evento de proyecto aprobado
   */
  async emitProjectApproved(projectId: string): Promise<void> {
    await this.emit('project.approved', { projectId });
    await this.n8nService.notifyProjectApproved(projectId);
  }

  /**
   * Emitir evento de tiempo registrado
   */
  async emitTimeTracked(timeEntryId: string): Promise<void> {
    await this.emit('time.tracked', { timeEntryId });
  }

  /**
   * Emitir evento de cliente sincronizado
   */
  async emitClientSynced(clientId: string): Promise<void> {
    await this.emit('client.synced', { clientId });
  }

  /**
   * Emitir evento de factura creada
   */
  async emitInvoiceCreated(
    projectId: string,
    invoiceId: string,
  ): Promise<void> {
    await this.emit('invoice.created', { projectId, invoiceId });
  }
}
