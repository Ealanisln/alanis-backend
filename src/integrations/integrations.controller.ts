import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { CurrentTenant } from '../common/decorators/auth.decorators';
import { InvoiceNinjaService } from './invoice-ninja/invoice-ninja.service';
import { N8nService } from './n8n/n8n.service';
import { EventsService } from '../events/events.service';

@ApiTags('Integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly invoiceNinjaService: InvoiceNinjaService,
    private readonly n8nService: N8nService,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Sincronizar cliente con Invoice Ninja
   */
  @Post('invoice-ninja/sync-client/:clientId')
  @ApiOperation({ summary: 'Sincronizar cliente con Invoice Ninja' })
  @ApiResponse({
    status: 200,
    description: 'Cliente sincronizado exitosamente',
  })
  @HttpCode(HttpStatus.OK)
  async syncClient(@Param('clientId') clientId: string) {
    // Obtener cliente desde la base de datos
    const client = await this.invoiceNinjaService['prisma'].client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    await this.invoiceNinjaService.syncClient(client);
    await this.eventsService.emitClientSynced(clientId);

    return { message: 'Cliente sincronizado exitosamente' };
  }

  /**
   * Crear factura desde proyecto
   */
  @Post('invoice-ninja/create-invoice/:projectId')
  @ApiOperation({ summary: 'Crear factura en Invoice Ninja desde proyecto' })
  @ApiResponse({ status: 201, description: 'Factura creada exitosamente' })
  async createInvoice(@Param('projectId') projectId: string) {
    const invoice = await this.invoiceNinjaService.createInvoice(projectId);
    await this.eventsService.emitInvoiceCreated(projectId, invoice.id);

    return {
      message: 'Factura creada exitosamente',
      invoice,
    };
  }

  /**
   * Generar reporte semanal
   */
  @Post('n8n/weekly-report')
  @ApiOperation({ summary: 'Generar reporte semanal via n8n' })
  @ApiResponse({ status: 200, description: 'Reporte semanal enviado' })
  @HttpCode(HttpStatus.OK)
  async generateWeeklyReport(@CurrentTenant('id') tenantId: string) {
    await this.n8nService.weeklyReport(tenantId);
    return { message: 'Reporte semanal enviado exitosamente' };
  }

  /**
   * Verificar conectividad con Invoice Ninja
   */
  @Get('invoice-ninja/test-connection')
  @ApiOperation({ summary: 'Verificar conectividad con Invoice Ninja' })
  @ApiResponse({ status: 200, description: 'Estado de conectividad' })
  async testInvoiceNinjaConnection() {
    const isConnected = await this.invoiceNinjaService.testConnection();
    return {
      service: 'Invoice Ninja',
      connected: isConnected,
      status: isConnected ? 'OK' : 'ERROR',
    };
  }

  /**
   * Verificar conectividad con n8n
   */
  @Get('n8n/test-connection')
  @ApiOperation({ summary: 'Verificar conectividad con n8n' })
  @ApiResponse({ status: 200, description: 'Estado de conectividad' })
  async testN8nConnection() {
    const isConnected = await this.n8nService.testConnection();
    return {
      service: 'n8n',
      connected: isConnected,
      status: isConnected ? 'OK' : 'ERROR',
    };
  }

  /**
   * Obtener estado de todas las integraciones
   */
  @Get('status')
  @ApiOperation({ summary: 'Obtener estado de todas las integraciones' })
  @ApiResponse({ status: 200, description: 'Estado de integraciones' })
  async getIntegrationsStatus() {
    const [invoiceNinjaStatus, n8nStatus] = await Promise.all([
      this.invoiceNinjaService.testConnection(),
      this.n8nService.testConnection(),
    ]);

    return {
      integrations: {
        'invoice-ninja': {
          connected: invoiceNinjaStatus,
          status: invoiceNinjaStatus ? 'OK' : 'ERROR',
        },
        n8n: {
          connected: n8nStatus,
          status: n8nStatus ? 'OK' : 'ERROR',
        },
      },
      overall: invoiceNinjaStatus && n8nStatus ? 'OK' : 'PARTIAL',
    };
  }
}
