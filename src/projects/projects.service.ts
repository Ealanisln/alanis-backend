import { Injectable, NotFoundException } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProjectDto: CreateProjectDto,
    tenantId: string,
  ): Promise<Project> {
    // Verify client exists and belongs to tenant
    const client = await this.prisma.client.findFirst({
      where: {
        id: createProjectDto.clientId,
        tenantId,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description,
        quotedHours: createProjectDto.quotedHours,
        hourlyRate: createProjectDto.hourlyRate,
        startDate: createProjectDto.startDate
          ? new Date(createProjectDto.startDate)
          : null,
        endDate: createProjectDto.endDate
          ? new Date(createProjectDto.endDate)
          : null,
        quotationData: createProjectDto.quotationData,
        clientId: createProjectDto.clientId,
        tenantId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return project;
  }

  async findAll(tenantId: string) {
    return this.prisma.project.findMany({
      where: { tenantId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        activities: {
          select: {
            id: true,
            description: true,
            type: true,
            duration: true,
            hourlyRate: true,
            startTime: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { startTime: 'desc' },
          take: 10,
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    tenantId: string,
  ): Promise<Project> {
    const existingProject = await this.prisma.project.findFirst({
      where: { id, tenantId },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        name: updateProjectDto.name,
        description: updateProjectDto.description,
        status: updateProjectDto.status,
        quotedHours: updateProjectDto.quotedHours,
        hourlyRate: updateProjectDto.hourlyRate,
        startDate: updateProjectDto.startDate
          ? new Date(updateProjectDto.startDate)
          : undefined,
        endDate: updateProjectDto.endDate
          ? new Date(updateProjectDto.endDate)
          : undefined,
        quotationData: updateProjectDto.quotationData,
      },
    });

    return project;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const existingProject = await this.prisma.project.findFirst({
      where: { id, tenantId },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    await this.prisma.project.delete({
      where: { id },
    });
  }
}
