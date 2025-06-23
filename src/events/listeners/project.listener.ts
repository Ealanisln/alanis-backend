import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InvoiceNinjaService } from '../../integrations/invoice-ninja/invoice-ninja.service';
import { N8nService } from '../../integrations/n8n/n8n.service';

@Injectable()
export class ProjectEventListener {
  private readonly logger = new Logger(ProjectEventListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly invoiceNinjaService: InvoiceNinjaService,
    private readonly n8nService: N8nService,
  ) {}

  /**
   * Manejar evento cuando un proyecto es aprobado
   */
  @OnEvent('project.approved')
  async handleProjectApproved(payload: { projectId: string }): Promise<void> {
    try {
      this.logger.log(`Handling project approved event: ${payload.projectId}`);

      const project = await this.prisma.project.findUnique({
        where: { id: payload.projectId },
        include: {
          client: true,
          tenant: true,
        },
      });

      if (!project) {
        this.logger.error(`Proyecto ${payload.projectId} no encontrado`);
        return;
      }

      // Sincronizar cliente con Invoice Ninja si no está sincronizado
      if (!project.client.invoiceNinjaId) {
        await this.invoiceNinjaService.syncClient(project.client);
      }

      // Notificar via n8n
      await this.n8nService.notifyProjectApproved(payload.projectId);

      this.logger.log(`Proyecto ${payload.projectId} procesado exitosamente`);
    } catch (error: any) {
      this.logger.error(`Error handling project approved:`, error.message);
    }
  }

  /**
   * Manejar evento cuando se registra tiempo
   */
  @OnEvent('time.tracked')
  async handleTimeTracked(payload: { timeEntryId: string }): Promise<void> {
    try {
      this.logger.log(`Handling time tracked event: ${payload.timeEntryId}`);

      const timeEntry = await this.prisma.timeEntry.findUnique({
        where: { id: payload.timeEntryId },
        include: {
          project: {
            include: {
              client: true,
              tenant: true,
            },
          },
        },
      });

      if (!timeEntry) {
        this.logger.error(`Time entry ${payload.timeEntryId} no encontrado`);
        return;
      }

      // Actualizar horas usadas del proyecto
      await this.prisma.project.update({
        where: { id: timeEntry.projectId },
        data: {
          usedHours: {
            increment: timeEntry.hours,
          },
        },
      });

      // Recargar proyecto con horas actualizadas
      const updatedProject = await this.prisma.project.findUnique({
        where: { id: timeEntry.projectId },
        include: {
          client: true,
          tenant: true,
        },
      });

      if (updatedProject) {
        // Notificar via n8n
        await this.n8nService.notifyTimeTracked(timeEntry, updatedProject);
      }

      this.logger.log(
        `Time entry ${payload.timeEntryId} procesado exitosamente`,
      );
    } catch (error: any) {
      this.logger.error(`Error handling time tracked:`, error.message);
    }
  }

  /**
   * Manejar evento cuando se crea una factura
   */
  @OnEvent('invoice.created')
  async handleInvoiceCreated(payload: {
    projectId: string;
    invoiceId: string;
  }): Promise<void> {
    try {
      this.logger.log(`Handling invoice created event: ${payload.invoiceId}`);

      const project = await this.prisma.project.findUnique({
        where: { id: payload.projectId },
        include: {
          client: true,
          tenant: true,
        },
      });

      if (!project) {
        this.logger.error(`Proyecto ${payload.projectId} no encontrado`);
        return;
      }

      // Notificar via n8n
      await this.n8nService.triggerWorkflow(
        'invoice-created',
        {
          project: {
            id: project.id,
            name: project.name,
          },
          client: {
            id: project.client.id,
            name: project.client.name,
            email: project.client.email,
          },
          invoice: {
            id: payload.invoiceId,
          },
        },
        {
          id: project.tenantId,
          type: project.tenant.type,
        },
      );

      this.logger.log(`Invoice ${payload.invoiceId} procesada exitosamente`);
    } catch (error: any) {
      this.logger.error(`Error handling invoice created:`, error.message);
    }
  }
}
