import { Injectable, NotFoundException } from '@nestjs/common';
import { TimeEntry, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { TimeEntryQueryDto } from './dto/time-entry-query.dto';

export interface TimeEntryWithRelations {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  hours: number;
  date: Date;
  project?: {
    name: string;
  };
}

@Injectable()
export class TimeTrackingService {
  constructor(private prisma: PrismaService) {}

  async createTimeEntry(
    createTimeEntryDto: CreateTimeEntryDto,
    userId: string,
  ): Promise<TimeEntry> {
    // Validar que el proyecto pertenece al tenant del usuario
    const project = await this.prisma.project.findFirst({
      where: {
        id: createTimeEntryDto.projectId,
        tenant: {
          users: {
            some: { id: userId },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Validar task si se proporciona
    if (createTimeEntryDto.taskId) {
      const task = await this.prisma.task.findFirst({
        where: {
          id: createTimeEntryDto.taskId,
          projectId: project.id,
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }
    }

    const timeEntry = await this.prisma.timeEntry.create({
      data: {
        description: createTimeEntryDto.description,
        hours: createTimeEntryDto.hours,
        date: createTimeEntryDto.date,
        notes: createTimeEntryDto.notes,
        hourlyRate: createTimeEntryDto.hourlyRate,
        projectId: createTimeEntryDto.projectId,
        taskId: createTimeEntryDto.taskId,
        userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            quotedHours: true,
            usedHours: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Actualizar horas usadas del proyecto
    await this.updateProjectHours(project.id);

    // Obtener proyecto actualizado para el evento
    const updatedProject = await this.prisma.project.findUnique({
      where: { id: project.id },
    });

    if (!updatedProject) {
      throw new NotFoundException('Updated project not found');
    }

    // TODO: Re-implement events when EventsService dependency is resolved
    // Emitir evento para n8n
    // await this.eventsService.emitTimeTracked(
    //   timeEntry,
    //   updatedProject.quotedHours - updatedProject.usedHours,
    // );

    // Verificar si hay que enviar alertas de horas
    const percentageUsed =
      (updatedProject.usedHours / updatedProject.quotedHours) * 100;
    if (percentageUsed >= 80) {
      // await this.eventsService.emitProjectHoursWarning(
      //   updatedProject,
      //   percentageUsed,
      // );
    }

    return timeEntry;
  }

  private async updateProjectHours(projectId: string): Promise<void> {
    const totalHours = await this.prisma.timeEntry.aggregate({
      where: { projectId },
      _sum: { hours: true },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { usedHours: totalHours._sum.hours || 0 },
    });
  }

  async getProjectTimeReport(projectId: string, tenantId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId },
      include: {
        timeEntries: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            task: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const summary = {
      totalQuoted: project.quotedHours,
      totalUsed: project.usedHours,
      remaining: project.quotedHours - project.usedHours,
      percentageUsed: (project.usedHours / project.quotedHours) * 100,
      entries: project.timeEntries,
      byUser: this.groupTimeEntriesByUser(project.timeEntries),
      byDate: this.groupTimeEntriesByDate(project.timeEntries),
    };

    return summary;
  }

  async getUserTimeEntries(userId: string, query: TimeEntryQueryDto) {
    const {
      page = 1,
      limit = 10,
      projectId,
      startDate,
      endDate,
      search,
    } = query;

    const where: Prisma.TimeEntryWhereInput = {
      userId,
      ...(projectId && { projectId }),
      ...(startDate &&
        endDate && {
          date: {
            gte: startDate,
            lte: endDate,
          },
        }),
      ...(search && {
        description: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    };

    const [timeEntries, total] = await Promise.all([
      this.prisma.timeEntry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      this.prisma.timeEntry.count({ where }),
    ]);

    return {
      timeEntries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private groupTimeEntriesByUser(timeEntries: TimeEntryWithRelations[]) {
    const userGroups: Record<
      string,
      { userName: string; hours: number; projects: Record<string, number> }
    > = {};

    for (const entry of timeEntries) {
      const userId = entry.user.id;
      if (!userGroups[userId]) {
        userGroups[userId] = {
          userName: `${entry.user.firstName} ${entry.user.lastName}`,
          hours: 0,
          projects: {},
        };
      }

      userGroups[userId].hours += entry.hours;

      if (entry.project) {
        const projectName = entry.project.name;
        if (!userGroups[userId].projects[projectName]) {
          userGroups[userId].projects[projectName] = 0;
        }
        userGroups[userId].projects[projectName] += entry.hours;
      }
    }

    return Object.entries(userGroups).map(([userId, data]) => ({
      userId,
      userName: data.userName,
      hours: data.hours,
      projects: data.projects,
    }));
  }

  private groupTimeEntriesByDate(timeEntries: TimeEntryWithRelations[]) {
    const dateGroups: Record<
      string,
      { date: string; hours: number; entries: TimeEntryWithRelations[] }
    > = {};

    for (const entry of timeEntries) {
      const date = new Date(entry.date).toISOString().split('T')[0] || '';
      if (!dateGroups[date]) {
        dateGroups[date] = {
          date,
          hours: 0,
          entries: [],
        };
      }

      dateGroups[date].hours += entry.hours;
      dateGroups[date].entries.push(entry);
    }

    return Object.values(dateGroups).map(({ date, hours, entries }) => ({
      date: new Date(date),
      hours,
      entries,
    }));
  }

  async deleteTimeEntry(id: string, userId: string): Promise<void> {
    const timeEntry = await this.prisma.timeEntry.findFirst({
      where: { id, userId },
    });

    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }

    await this.prisma.timeEntry.delete({
      where: { id },
    });

    // Update project hours after deletion
    await this.updateProjectHours(timeEntry.projectId);
  }

  async updateTimeEntry(
    id: string,
    updateData: Partial<CreateTimeEntryDto>,
    userId: string,
  ): Promise<TimeEntry> {
    const existingEntry = await this.prisma.timeEntry.findFirst({
      where: { id, userId },
    });

    if (!existingEntry) {
      throw new NotFoundException('Time entry not found');
    }

    const timeEntry = await this.prisma.timeEntry.update({
      where: { id },
      data: {
        description: updateData.description,
        hours: updateData.hours,
        date: updateData.date,
        notes: updateData.notes,
        hourlyRate: updateData.hourlyRate,
      },
    });

    // Update project hours
    await this.updateProjectHours(existingEntry.projectId);

    return timeEntry;
  }
}
