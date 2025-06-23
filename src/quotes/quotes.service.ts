import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto, QuoteStatus } from './dto/update-quote.dto';
import { QuoteQueryDto } from './dto/quote-query.dto';
import { Prisma, Quote } from '@prisma/client';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuoteDto: CreateQuoteDto, tenantId: string): Promise<Quote> {
    // Generate unique quote number
    const quoteNumber = await this.generateQuoteNumber(tenantId);

    try {
      const quote = await this.prisma.quote.create({
        data: {
          ...createQuoteDto,
          services: createQuoteDto.services as any, // Cast to any for JSON compatibility
          quoteNumber,
          tenantId,
          // Convert date string to Date object if provided
          validUntil: createQuoteDto.validUntil
            ? new Date(createQuoteDto.validUntil)
            : null,
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          },
        },
      });

      return quote;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Quote number already exists');
        }
      }
      throw error;
    }
  }

  async findAll(
    tenantId: string,
    query: QuoteQueryDto = {},
  ): Promise<{
    data: Quote[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      page = 1,
      limit = 10,
      quoteNumber,
      clientEmail,
      clientName,
      status,
      projectType,
      startDate,
      endDate,
      orderBy = 'createdAt',
      orderDirection = 'desc',
      search,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: Prisma.QuoteWhereInput = {
      tenantId,
      ...(quoteNumber && {
        quoteNumber: {
          contains: quoteNumber,
          mode: 'insensitive',
        },
      }),
      ...(clientEmail && {
        clientEmail: {
          contains: clientEmail,
          mode: 'insensitive',
        },
      }),
      ...(clientName && {
        clientName: {
          contains: clientName,
          mode: 'insensitive',
        },
      }),
      ...(status && { status }),
      ...(projectType && { projectType }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      ...(search && {
        OR: [
          {
            clientName: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            clientEmail: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            projectName: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            quoteNumber: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    // Execute queries in parallel
    const [quotes, total] = await Promise.all([
      this.prisma.quote.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          [orderBy]: orderDirection,
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          },
        },
      }),
      this.prisma.quote.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: quotes,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string, tenantId: string): Promise<Quote> {
    const quote = await this.prisma.quote.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
          },
        },
        convertedProject: {
          select: {
            id: true,
            name: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    return quote;
  }

  async findByQuoteNumber(
    quoteNumber: string,
    tenantId: string,
  ): Promise<Quote | null> {
    return this.prisma.quote.findFirst({
      where: {
        quoteNumber,
        tenantId,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    updateQuoteDto: UpdateQuoteDto,
    tenantId: string,
  ): Promise<Quote> {
    // Check if quote exists
    const existingQuote = await this.findOne(id, tenantId);

    try {
      const quote = await this.prisma.quote.update({
        where: {
          id,
          tenantId,
        },
        data: {
          ...updateQuoteDto,
          // Cast services to any for JSON compatibility
          ...(updateQuoteDto.services && { services: updateQuoteDto.services as any }),
          // Convert date string to Date object if provided
          validUntil: updateQuoteDto.validUntil
            ? new Date(updateQuoteDto.validUntil)
            : undefined,
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          },
        },
      });

      return quote;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Quote number already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<Quote> {
    // Check if quote exists
    await this.findOne(id, tenantId);

    return this.prisma.quote.delete({
      where: {
        id,
        tenantId,
      },
    });
  }

  async markAsViewed(id: string, tenantId: string): Promise<Quote> {
    return this.update(id, { status: QuoteStatus.VIEWED }, tenantId);
  }

  async approve(id: string, tenantId: string): Promise<Quote> {
    return this.update(id, { status: QuoteStatus.APPROVED }, tenantId);
  }

  async reject(id: string, tenantId: string): Promise<Quote> {
    return this.update(id, { status: QuoteStatus.REJECTED }, tenantId);
  }

  async convertToProject(id: string, tenantId: string): Promise<Quote> {
    const quote = await this.findOne(id, tenantId);

    if (quote.status !== QuoteStatus.APPROVED) {
      throw new ConflictException(
        'Only approved quotes can be converted to projects',
      );
    }

    // Check if quote has already been converted (via projectId field)
    if (quote.projectId) {
      throw new ConflictException('Quote has already been converted to project');
    }

    // This would integrate with the projects service
    // For now, we just mark it as converted
    return this.update(id, { status: QuoteStatus.CONVERTED }, tenantId);
  }

  private async generateQuoteNumber(tenantId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = 'QUO';

    // Get the count of quotes for this year and tenant
    const count = await this.prisma.quote.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `${prefix}-${currentYear}-${sequence}`;
  }

  async getQuoteStats(tenantId: string): Promise<{
    total: number;
    byStatus: Record<QuoteStatus, number>;
    totalValue: number;
    averageValue: number;
  }> {
    const [total, quotes] = await Promise.all([
      this.prisma.quote.count({
        where: { tenantId },
      }),
      this.prisma.quote.findMany({
        where: { tenantId },
        select: {
          status: true,
          total: true,
        },
      }),
    ]);

    const byStatus = quotes.reduce(
      (acc, quote) => {
        acc[quote.status as QuoteStatus] = (acc[quote.status as QuoteStatus] || 0) + 1;
        return acc;
      },
      {} as Record<QuoteStatus, number>,
    );

    const totalValue = quotes.reduce(
      (sum, quote) => sum + Number(quote.total),
      0,
    );

    const averageValue = total > 0 ? totalValue / total : 0;

    return {
      total,
      byStatus,
      totalValue,
      averageValue,
    };
  }
} 