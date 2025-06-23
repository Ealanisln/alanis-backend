import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteQueryDto } from './dto/quote-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { CurrentTenant, Public } from '../common/decorators/auth.decorators';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new quote',
    description: 'Create a new quote from the website calculator. This endpoint is public for web integration.',
  })
  @ApiResponse({
    status: 201,
    description: 'Quote created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  async create(@Body() createQuoteDto: CreateQuoteDto) {
    // For public quotes, we use a default tenant (Alanis Web Dev)
    // This should be configured in environment variables
    const defaultTenantId = process.env.DEFAULT_TENANT_ID || 'default-tenant-id';
    return this.quotesService.create(createQuoteDto, defaultTenantId);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new quote (Admin)',
    description: 'Create a new quote from the admin panel with authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Quote created successfully',
  })
  async createAdmin(
    @Body() createQuoteDto: CreateQuoteDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.quotesService.create(createQuoteDto, tenantId);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all quotes',
    description: 'Get all quotes for the current tenant with filtering and pagination.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Quotes retrieved successfully',
  })
  async findAll(
    @Query() query: QuoteQueryDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.quotesService.findAll(tenantId, query);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get quote statistics',
    description: 'Get statistics about quotes for the current tenant.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote statistics retrieved successfully',
  })
  async getStats(@CurrentTenant() tenantId: string) {
    return this.quotesService.getQuoteStats(tenantId);
  }

  @Public()
  @Get('public/:quoteNumber')
  @ApiOperation({
    summary: 'Get quote by quote number (Public)',
    description: 'Get quote details by quote number. Public endpoint for client viewing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Quote not found',
  })
  async findByQuoteNumberPublic(@Param('quoteNumber') quoteNumber: string) {
    // For public access, we use the default tenant
    const defaultTenantId = process.env.DEFAULT_TENANT_ID || 'default-tenant-id';
    const quote = await this.quotesService.findByQuoteNumber(quoteNumber, defaultTenantId);
    
    if (quote) {
      // Mark as viewed when accessed publicly
      await this.quotesService.markAsViewed(quote.id, defaultTenantId);
    }
    
    return quote;
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get quote by ID',
    description: 'Get a specific quote by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Quote not found',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.quotesService.findOne(id, tenantId);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update quote',
    description: 'Update a quote by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Quote not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.quotesService.update(id, updateQuoteDto, tenantId);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete quote',
    description: 'Delete a quote by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Quote not found',
  })
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.quotesService.remove(id, tenantId);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Patch(':id/approve')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Approve quote',
    description: 'Mark a quote as approved.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote approved successfully',
  })
  async approve(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.quotesService.approve(id, tenantId);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Patch(':id/reject')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reject quote',
    description: 'Mark a quote as rejected.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote rejected successfully',
  })
  async reject(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.quotesService.reject(id, tenantId);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post(':id/convert-to-project')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Convert quote to project',
    description: 'Convert an approved quote to a project.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote converted to project successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Quote cannot be converted (not approved or already converted)',
  })
  async convertToProject(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.quotesService.convertToProject(id, tenantId);
  }
} 