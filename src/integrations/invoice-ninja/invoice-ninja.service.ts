import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Client, TimeEntry, SyncStatus, Prisma } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

interface InvoiceNinjaClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  vat_number?: string;
  address1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_id?: string;
  custom_value1?: string;
  custom_value2?: string;
}

interface InvoiceNinjaLineItem {
  product_key: string;
  notes: string;
  quantity: number;
  cost: number;
}

interface InvoiceNinjaInvoice {
  client_id: string;
  line_items: InvoiceNinjaLineItem[];
  custom_value1?: string;
  custom_value2?: string;
}

interface GroupedTimeEntry {
  taskName: string;
  description: string;
  hours: number;
}

interface AddressData {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    client: true;
    timeEntries: {
      include: {
        task: true;
        user: true;
      };
    };
  };
}>;

@Injectable()
export class InvoiceNinjaService {
  private readonly logger = new Logger(InvoiceNinjaService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.apiUrl = this.configService.get<string>('INVOICE_NINJA_URL') || '';
    this.apiKey = this.configService.get<string>('INVOICE_NINJA_API_KEY') || '';
  }

  /**
   * Sincronizar cliente con Invoice Ninja
   */
  async syncClient(client: Client): Promise<void> {
    try {
      this.logger.log(`Sincronizando cliente ${client.id} con Invoice Ninja`);

      const address = client.address as AddressData | null;
      const invoiceNinjaClient = await this.createOrUpdateClient({
        name: client.name,
        email: client.email,
        phone: client.phone || undefined,
        vat_number: client.taxId || undefined,
        address1: address?.street,
        city: address?.city,
        state: address?.state,
        postal_code: address?.zipCode,
        country_id: '840', // US por defecto
        custom_value1: client.id, // ID de nuestro sistema
        custom_value2: client.tenantId,
      });

      await this.prisma.client.update({
        where: { id: client.id },
        data: {
          invoiceNinjaId: invoiceNinjaClient.id,
          syncStatus: SyncStatus.SYNCED,
          lastSyncAt: new Date(),
        },
      });

      this.logger.log(`Cliente ${client.id} sincronizado exitosamente`);
    } catch (error) {
      this.logger.error(`Error sincronizando cliente ${client.id}:`, error);

      await this.prisma.client.update({
        where: { id: client.id },
        data: {
          syncStatus: SyncStatus.ERROR,
        },
      });

      throw error;
    }
  }

  /**
   * Crear factura desde proyecto
   */
  async createInvoice(projectId: string): Promise<any> {
    const project = (await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        timeEntries: {
          where: {
            billable: true,
            billed: false,
          },
          include: {
            task: true,
            user: true,
          },
        },
      },
    })) as ProjectWithRelations | null;

    if (!project) {
      throw new Error(`Proyecto ${projectId} no encontrado`);
    }

    if (!project.client.invoiceNinjaId) {
      this.logger.log(`Cliente no sincronizado, sincronizando...`);
      await this.syncClient(project.client);

      // Recargar el cliente con el nuevo invoiceNinjaId
      const updatedClient = await this.prisma.client.findUnique({
        where: { id: project.client.id },
      });

      if (!updatedClient?.invoiceNinjaId) {
        throw new Error('Error sincronizando cliente con Invoice Ninja');
      }

      project.client.invoiceNinjaId = updatedClient.invoiceNinjaId;
    }

    const lineItems = this.groupTimeEntriesByTask(project.timeEntries);

    const invoiceData: InvoiceNinjaInvoice = {
      client_id: project.client.invoiceNinjaId,
      line_items: lineItems.map((item) => ({
        product_key: item.taskName || 'Development Hours',
        notes: item.description,
        quantity: item.hours,
        cost: Number(project.hourlyRate),
      })),
      custom_value1: project.id,
      custom_value2: project.tenantId,
    };

    const invoice = await this.createInvoiceNinja(invoiceData);

    // Marcar time entries como facturadas
    await this.prisma.timeEntry.updateMany({
      where: {
        projectId,
        billable: true,
        billed: false,
      },
      data: { billed: true },
    });

    this.logger.log(`Factura creada para proyecto ${projectId}: ${invoice.id}`);
    return invoice;
  }

  /**
   * Crear o actualizar cliente en Invoice Ninja
   */
  private async createOrUpdateClient(
    clientData: Partial<InvoiceNinjaClient>,
  ): Promise<InvoiceNinjaClient> {
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    try {
      // Intentar buscar cliente existente por custom_value1 (nuestro ID)
      const searchResponse = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/api/v1/clients`, {
          headers,
          params: {
            custom_value1: clientData.custom_value1,
          },
        }),
      );

      const existingClient = searchResponse.data.data?.[0];

      if (existingClient) {
        // Actualizar cliente existente
        const updateResponse = await firstValueFrom(
          this.httpService.put(
            `${this.apiUrl}/api/v1/clients/${existingClient.id}`,
            clientData,
            { headers },
          ),
        );
        return updateResponse.data.data;
      } else {
        // Crear nuevo cliente
        const createResponse = await firstValueFrom(
          this.httpService.post(`${this.apiUrl}/api/v1/clients`, clientData, {
            headers,
          }),
        );
        return createResponse.data.data;
      }
    } catch (error: any) {
      this.logger.error(
        'Error en Invoice Ninja API:',
        error.response?.data || error.message,
      );
      throw new Error(
        `Error creando/actualizando cliente en Invoice Ninja: ${error.message}`,
      );
    }
  }

  /**
   * Crear factura en Invoice Ninja
   */
  private async createInvoiceNinja(
    invoiceData: InvoiceNinjaInvoice,
  ): Promise<any> {
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/api/v1/invoices`, invoiceData, {
          headers,
        }),
      );
      return response.data.data;
    } catch (error: any) {
      this.logger.error(
        'Error creando factura en Invoice Ninja:',
        error.response?.data || error.message,
      );
      throw new Error(
        `Error creando factura en Invoice Ninja: ${error.message}`,
      );
    }
  }

  /**
   * Agrupar time entries por tarea para facturación
   */
  private groupTimeEntriesByTask(
    timeEntries: (TimeEntry & { task?: any; user: any })[],
  ): GroupedTimeEntry[] {
    const grouped = timeEntries.reduce(
      (acc, entry) => {
        const taskName = entry.task?.title || 'General Development';
        const key = `${taskName}_${entry.description}`;

        if (!acc[key]) {
          acc[key] = {
            taskName,
            description: entry.description,
            hours: 0,
          };
        }

        acc[key].hours += entry.hours;
        return acc;
      },
      {} as Record<string, GroupedTimeEntry>,
    );

    return Object.values(grouped);
  }

  /**
   * Verificar conectividad con Invoice Ninja
   */
  async testConnection(): Promise<boolean> {
    try {
      const headers = {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };

      await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/api/v1/ping`, { headers }),
      );

      return true;
    } catch (error: any) {
      this.logger.error('Error conectando con Invoice Ninja:', error.message);
      return false;
    }
  }
}
