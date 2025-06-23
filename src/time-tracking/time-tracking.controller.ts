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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TimeTrackingService } from './time-tracking.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { TimeEntryQueryDto } from './dto/time-entry-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import {
  CurrentUser,
  CurrentTenant,
} from '../common/decorators/auth.decorators';
import { JwtPayload } from '../common/types/auth.types';

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
}

@Controller('time-tracking')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiTags('time-tracking')
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  @Post('entries')
  @ApiOperation({ summary: 'Create time entry' })
  @ApiResponse({
    status: 201,
    description: 'Time entry created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async createEntry(
    @Body() createTimeEntryDto: CreateTimeEntryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.timeTrackingService.createTimeEntry(
      createTimeEntryDto,
      user.sub,
    );
  }

  @Get('projects/:projectId/report')
  @ApiOperation({ summary: 'Get project time report' })
  @ApiResponse({
    status: 200,
    description: 'Project time report retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getProjectReport(
    @Param('projectId') projectId: string,
    @CurrentTenant() tenant: TenantInfo,
  ) {
    return this.timeTrackingService.getProjectTimeReport(projectId, tenant.id);
  }

  @Get('my-entries')
  @ApiOperation({ summary: 'Get my time entries' })
  @ApiResponse({
    status: 200,
    description: 'User time entries retrieved successfully',
  })
  async getMyEntries(
    @CurrentUser() user: JwtPayload,
    @Query() query: TimeEntryQueryDto,
  ) {
    return this.timeTrackingService.getUserTimeEntries(user.sub, query);
  }

  @Patch('entries/:id')
  @ApiOperation({ summary: 'Update time entry' })
  @ApiResponse({
    status: 200,
    description: 'Time entry updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Time entry not found',
  })
  async updateEntry(
    @Param('id') id: string,
    @Body() updateData: UpdateTimeEntryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.timeTrackingService.updateTimeEntry(id, updateData, user.sub);
  }

  @Delete('entries/:id')
  @ApiOperation({ summary: 'Delete time entry' })
  @ApiResponse({
    status: 200,
    description: 'Time entry deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Time entry not found',
  })
  async deleteEntry(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.timeTrackingService.deleteTimeEntry(id, user.sub);
    return { message: 'Time entry deleted successfully' };
  }
}
