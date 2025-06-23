import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EventPayload {
  [key: string]: any;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Emit an event to external systems (n8n webhook)
   */
  async emit(eventType: string, payload: EventPayload): Promise<void> {
    try {
      const webhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL');

      if (!webhookUrl) {
        this.logger.warn(
          'N8N_WEBHOOK_URL not configured, skipping event emission',
        );
        return;
      }

      const eventData = {
        eventType,
        timestamp: new Date().toISOString(),
        payload,
      };

      // Send webhook to n8n
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.logger.log(`Event emitted successfully: ${eventType}`);
    } catch (error) {
      this.logger.error(`Failed to emit event ${eventType}:`, error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Emit time tracking events
   */
  async emitTimeTracked(timeEntry: any, remainingHours: number): Promise<void> {
    await this.emit('time.tracked', {
      timeEntry,
      remainingHours,
    });
  }

  /**
   * Emit project status change events
   */
  async emitProjectStatusChanged(
    project: any,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    await this.emit('project.status_changed', {
      project,
      oldStatus,
      newStatus,
    });
  }

  /**
   * Emit project hours warning events
   */
  async emitProjectHoursWarning(
    project: any,
    percentageUsed: number,
  ): Promise<void> {
    await this.emit('project.hours_warning', {
      project,
      percentageUsed,
      remainingHours: project.quotedHours - project.usedHours,
    });
  }
}
