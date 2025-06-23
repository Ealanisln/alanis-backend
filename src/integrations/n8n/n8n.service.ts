import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Project, TimeEntry, Client, Tenant } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

interface TenantInfo {
  id: string;
  type?: string;
}

interface WorkflowPayload {
  workflow: string;
  tenant: TenantInfo;
  timestamp: string;
  data: any;
}

interface WeeklySummary {
  totalHours: number;
  totalProjects: number;
  totalClients: number;
  topProjects: Array<{
    name: string;
    hours: number;
    client: string;
  }>;
  teamActivity: Array<{
    userName: string;
    hours: number;
    projects: number;
  }>;
}

type ProjectWithClient = Project & {
  client: Client;
  tenant: Tenant;
};

@Injectable()
export class N8nService {
  private readonly logger = new Logger(N8nService.name);
  private readonly webhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.webhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL') || '';
  }

  /**
   * Disparar workflow en n8n
   */
  async triggerWorkflow(
    workflow: string,
    data: any,
    tenant: TenantInfo,
  ): Promise<void> {
    try {
      const payload: WorkflowPayload = {
        workflow,
        tenant: {
          id: tenant.id,
          type: tenant.type,
        },
        timestamp: new Date().toISOString(),
        data,
      };

      this.logger.log(
        `Disparando workflow: ${workflow} para tenant: ${tenant.id}`,
      );

      await firstValueFrom(
        this.httpService.post(`${this.webhookUrl}/${workflow}`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 segundos timeout
        }),
      );

      this.logger.log(`Workflow ${workflow} disparado exitosamente`);
    } catch (error: any) {
      this.logger.error(
        `Error disparando workflow ${workflow}:`,
        error.message,
      );
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Notificar cuando quedan pocas horas en un proyecto
   */
  async notifyLowHours(project: ProjectWithClient): Promise<void> {
    const remainingHours = project.quotedHours - project.usedHours;
    const remainingPercentage = (remainingHours / project.quotedHours) * 100;

    if (remainingPercentage <= 20) {
      this.logger.log(`Notificando horas bajas para proyecto: ${project.name}`);

      await this.triggerWorkflow(
        'low-hours-alert',
        {
          project: {
            id: project.id,
            name: project.name,
            remainingHours,
            remainingPercentage: Math.round(remainingPercentage),
            quotedHours: project.quotedHours,
            usedHours: project.usedHours,
          },
          client: {
            id: project.client.id,
            name: project.client.name,
            email: project.client.email,
          },
        },
        {
          id: project.tenantId,
          type: project.tenant.type,
        },
      );
    }
  }

  /**
   * Generar y enviar reporte semanal
   */
  async weeklyReport(tenantId: string): Promise<void> {
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);

      const timeEntries = await this.prisma.timeEntry.findMany({
        where: {
          project: { tenantId },
          date: { gte: startOfWeek },
        },
        include: {
          project: {
            include: {
              client: true,
            },
          },
          user: true,
        },
      });

      const summary = this.generateWeeklySummary(timeEntries);

      await this.triggerWorkflow('weekly-report', summary, { id: tenantId });

      this.logger.log(`Reporte semanal enviado para tenant: ${tenantId}`);
    } catch (error: any) {
      this.logger.error(`Error generando reporte semanal:`, error.message);
    }
  }

  /**
   * Notificar cuando un proyecto es aprobado
   */
  async notifyProjectApproved(projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        tenant: true,
      },
    });

    if (!project) {
      this.logger.error(`Proyecto ${projectId} no encontrado`);
      return;
    }

    await this.triggerWorkflow(
      'project-approved',
      {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          quotedHours: project.quotedHours,
          hourlyRate: Number(project.hourlyRate),
          startDate: project.startDate,
          endDate: project.endDate,
        },
        client: {
          id: project.client.id,
          name: project.client.name,
          email: project.client.email,
          company: project.client.company,
        },
      },
      {
        id: project.tenantId,
        type: project.tenant.type,
      },
    );
  }

  /**
   * Notificar cuando se registra tiempo en un proyecto
   */
  async notifyTimeTracked(
    timeEntry: TimeEntry,
    project: ProjectWithClient,
  ): Promise<void> {
    const remainingHours = project.quotedHours - project.usedHours;

    await this.triggerWorkflow(
      'time-tracked',
      {
        timeEntry: {
          id: timeEntry.id,
          description: timeEntry.description,
          hours: timeEntry.hours,
          date: timeEntry.date,
        },
        project: {
          id: project.id,
          name: project.name,
          remainingHours,
          usedHours: project.usedHours,
          quotedHours: project.quotedHours,
        },
        client: {
          id: project.client.id,
          name: project.client.name,
          email: project.client.email,
        },
      },
      {
        id: project.tenantId,
        type: project.tenant.type,
      },
    );

    // Verificar si quedan pocas horas
    if (remainingHours < 10) {
      await this.notifyLowHours(project);
    }
  }

  /**
   * Generar resumen semanal
   */
  private generateWeeklySummary(timeEntries: any[]): WeeklySummary {
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const uniqueProjects = new Set(
      timeEntries.map((entry) => entry.project.id),
    );
    const uniqueClients = new Set(
      timeEntries.map((entry) => entry.project.client.id),
    );

    // Top proyectos por horas
    const projectHours = timeEntries.reduce(
      (acc, entry) => {
        const projectId = entry.project.id;
        if (!acc[projectId]) {
          acc[projectId] = {
            name: entry.project.name,
            hours: 0,
            client: entry.project.client.name,
          };
        }
        acc[projectId].hours += entry.hours;
        return acc;
      },
      {} as Record<string, any>,
    );

    const topProjects = Object.values(projectHours)
      .sort((a: any, b: any) => b.hours - a.hours)
      .slice(0, 5) as Array<{
        name: string;
        hours: number;
        client: string;
      }>;

    // Actividad del equipo
    const teamActivity = timeEntries.reduce(
      (acc, entry) => {
        const userId = entry.user.id;
        if (!acc[userId]) {
          acc[userId] = {
            userName: `${entry.user.firstName} ${entry.user.lastName}`,
            hours: 0,
            projects: new Set(),
          };
        }
        acc[userId].hours += entry.hours;
        acc[userId].projects.add(entry.project.id);
        return acc;
      },
      {} as Record<string, any>,
    );

    const teamActivityArray = Object.values(teamActivity).map(
      (member: any) => ({
        userName: member.userName,
        hours: member.hours,
        projects: member.projects.size,
      }),
    );

    return {
      totalHours,
      totalProjects: uniqueProjects.size,
      totalClients: uniqueClients.size,
      topProjects,
      teamActivity: teamActivityArray,
    };
  }

  /**
   * Verificar conectividad con n8n
   */
  async testConnection(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.webhookUrl}/ping`, {
          timeout: 5000,
        }),
      );
      return true;
    } catch (error: any) {
      this.logger.error('Error conectando con n8n:', error.message);
      return false;
    }
  }
}
