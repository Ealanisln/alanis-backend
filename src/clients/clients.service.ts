import { Injectable, NotFoundException } from '@nestjs/common';
import { Client, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientQueryDto } from './dto/client-query.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createClientDto: CreateClientDto,
    tenantId: string,
  ): Promise<Client> {
    const { address, ...clientData } = createClientDto;
    
    const client = await this.prisma.client.create({
      data: {
        ...clientData,
        tenantId,
        address: address ? JSON.parse(JSON.stringify(address)) : null,
      },
    });

    return client;
  }

  async findAll(tenantId: string, query: ClientQueryDto) {
    const { page = 1, limit = 10, search, orderBy = 'createdAt' } = query;

    const where: Prisma.ClientWhereInput = {
      tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [orderBy]: 'desc' },
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string): Promise<Client> {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            quotedHours: true,
            usedHours: true,
            hourlyRate: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
    tenantId: string,
  ): Promise<Client> {
    const existingClient = await this.prisma.client.findFirst({
      where: { id, tenantId },
    });

    if (!existingClient) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    const { address, ...clientData } = updateClientDto;

    const client = await this.prisma.client.update({
      where: { id },
      data: {
        ...clientData,
        ...(address !== undefined && { 
          address: address ? JSON.parse(JSON.stringify(address)) : null 
        }),
      },
    });

    return client;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const existingClient = await this.prisma.client.findFirst({
      where: { id, tenantId },
    });

    if (!existingClient) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    await this.prisma.client.delete({
      where: { id },
    });
  }
}
