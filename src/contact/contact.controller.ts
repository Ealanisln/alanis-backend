import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactFormDto } from './dto/create-contact-form.dto';
import { UpdateContactFormDto } from './dto/update-contact-form.dto';
import { ContactFormQueryDto } from './dto/contact-form-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { CurrentUser, CurrentTenant, Public } from '../common/decorators/auth.decorators';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Enviar formulario de contacto',
    description: 'Endpoint público para enviar formularios de contacto desde el sitio web'
  })
  @ApiResponse({
    status: 201,
    description: 'Formulario de contacto enviado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async create(@Body() createContactFormDto: CreateContactFormDto, @Req() req: Request) {
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    return this.contactService.create(createContactFormDto, userAgent, ipAddress);
  }

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Listar formularios de contacto',
    description: 'Obtener lista paginada de formularios de contacto (solo administradores)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de formularios de contacto',
  })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: ContactFormQueryDto,
  ) {
    return this.contactService.findAll(tenantId, query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Estadísticas de formularios de contacto',
    description: 'Obtener estadísticas de formularios de contacto (solo administradores)'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de formularios de contacto',
  })
  async getStats(@CurrentTenant() tenantId: string) {
    return this.contactService.getStats(tenantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Ver formulario de contacto',
    description: 'Obtener detalles de un formulario de contacto específico'
  })
  @ApiParam({ name: 'id', description: 'ID del formulario de contacto' })
  @ApiResponse({
    status: 200,
    description: 'Detalles del formulario de contacto',
  })
  @ApiResponse({
    status: 404,
    description: 'Formulario de contacto no encontrado',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.contactService.findOne(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Actualizar formulario de contacto',
    description: 'Actualizar estado o respuesta de un formulario de contacto'
  })
  @ApiParam({ name: 'id', description: 'ID del formulario de contacto' })
  @ApiResponse({
    status: 200,
    description: 'Formulario de contacto actualizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Formulario de contacto no encontrado',
  })
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() updateContactFormDto: UpdateContactFormDto,
  ) {
    return this.contactService.update(id, tenantId, updateContactFormDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Eliminar formulario de contacto',
    description: 'Eliminar un formulario de contacto'
  })
  @ApiParam({ name: 'id', description: 'ID del formulario de contacto' })
  @ApiResponse({
    status: 200,
    description: 'Formulario de contacto eliminado',
  })
  @ApiResponse({
    status: 404,
    description: 'Formulario de contacto no encontrado',
  })
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.contactService.remove(id, tenantId);
  }
} 