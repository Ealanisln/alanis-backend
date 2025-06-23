import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateContactFormDto } from './dto/create-contact-form.dto';
import { UpdateContactFormDto } from './dto/update-contact-form.dto';
import { ContactFormQueryDto } from './dto/contact-form-query.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(
    createContactFormDto: CreateContactFormDto,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const defaultTenantId = this.configService.get<string>('DEFAULT_TENANT_ID');
    
    if (!defaultTenantId) {
      throw new BadRequestException('Default tenant not configured');
    }

    // Verificar que el tenant existe
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: defaultTenantId },
    });

    if (!tenant) {
      throw new BadRequestException('Default tenant not found');
    }

    return this.prisma.contactForm.create({
      data: {
        ...createContactFormDto,
        userAgent,
        ipAddress,
        tenantId: defaultTenantId,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async findAll(tenantId: string, query: ContactFormQueryDto) {
    const { page = 1, limit = 10, status, email, name, startDate, endDate, source } = query;
    
    const skip = (page - 1) * limit;
    
    const where: any = {
      tenantId,
    };

    if (status) {
      where.status = status;
    }

    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive',
      };
    }

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (source) {
      where.source = source;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [contactForms, total] = await Promise.all([
      this.prisma.contactForm.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.contactForm.count({ where }),
    ]);

    return {
      data: contactForms,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const contactForm = await this.prisma.contactForm.findFirst({
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
          },
        },
      },
    });

    if (!contactForm) {
      throw new NotFoundException('Contact form not found');
    }

    return contactForm;
  }

  async update(id: string, tenantId: string, updateContactFormDto: UpdateContactFormDto, respondedBy?: string) {
    const contactForm = await this.findOne(id, tenantId);

    const updateData: any = {
      ...updateContactFormDto,
    };

    // Si se está marcando como respondido, agregar metadata
    if (updateContactFormDto.status === 'RESPONDED' && updateContactFormDto.response) {
      updateData.respondedAt = new Date();
      updateData.respondedBy = respondedBy;
    }

    return this.prisma.contactForm.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.contactForm.delete({
      where: { id },
    });
  }

  async getStats(tenantId: string) {
    const [total, pending, responded, thisMonth, thisWeek] = await Promise.all([
      // Total
      this.prisma.contactForm.count({
        where: { tenantId },
      }),
      // Pending
      this.prisma.contactForm.count({
        where: {
          tenantId,
          status: 'PENDING',
        },
      }),
      // Responded
      this.prisma.contactForm.count({
        where: {
          tenantId,
          status: 'RESPONDED',
        },
      }),
      // This month
      this.prisma.contactForm.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      // This week
      this.prisma.contactForm.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total,
      pending,
      responded,
      thisMonth,
      thisWeek,
      responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
    };
  }
} 