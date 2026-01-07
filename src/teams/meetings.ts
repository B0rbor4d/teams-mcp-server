import type { Client } from '@microsoft/microsoft-graph-client';

export interface Meeting {
  id: string;
  subject: string;
  start: string;
  end: string;
  organizer: string;
  joinUrl?: string;
  participants: string[];
}

export class MeetingService {
  constructor(private client: Client) {}

  async getMeetings(limit: number = 10): Promise<Meeting[]> {
    try {
      const now = new Date().toISOString();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // Nächste 7 Tage

      const response = await this.client
        .api('/me/calendar/events')
        .filter(
          `isOnlineMeeting eq true and start/dateTime ge '${now}' and start/dateTime le '${endDate.toISOString()}'`
        )
        .select('id,subject,start,end,organizer,onlineMeeting,attendees')
        .top(limit)
        .orderby('start/dateTime')
        .get();

      return response.value.map((event: any) => ({
        id: event.id,
        subject: event.subject,
        start: event.start.dateTime,
        end: event.end.dateTime,
        organizer: event.organizer?.emailAddress?.name || 'Unknown',
        joinUrl: event.onlineMeeting?.joinUrl,
        participants: event.attendees?.map((a: any) => a.emailAddress?.name || 'Unknown') || [],
      }));
    } catch (error) {
      console.error('Error getting meetings:', error);
      throw new Error(`Failed to get meetings: ${error}`);
    }
  }

  async getMeetingById(meetingId: string): Promise<Meeting | null> {
    try {
      const event = await this.client
        .api(`/me/calendar/events/${meetingId}`)
        .select('id,subject,start,end,organizer,onlineMeeting,attendees')
        .get();

      if (!event.isOnlineMeeting) {
        return null;
      }

      return {
        id: event.id,
        subject: event.subject,
        start: event.start.dateTime,
        end: event.end.dateTime,
        organizer: event.organizer?.emailAddress?.name || 'Unknown',
        joinUrl: event.onlineMeeting?.joinUrl,
        participants: event.attendees?.map((a: any) => a.emailAddress?.name || 'Unknown') || [],
      };
    } catch (error) {
      console.error('Error getting meeting by ID:', error);
      return null;
    }
  }

  async createMeeting(
    subject: string,
    startDateTime: string,
    endDateTime: string,
    attendees: string[]
  ): Promise<Meeting> {
    try {
      const event = {
        subject: subject,
        start: {
          dateTime: startDateTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'UTC',
        },
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness',
        attendees: attendees.map((email) => ({
          emailAddress: {
            address: email,
          },
          type: 'required',
        })),
      };

      const response = await this.client.api('/me/calendar/events').post(event);

      return {
        id: response.id,
        subject: response.subject,
        start: response.start.dateTime,
        end: response.end.dateTime,
        organizer: response.organizer?.emailAddress?.name || 'Me',
        joinUrl: response.onlineMeeting?.joinUrl,
        participants: attendees,
      };
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw new Error(`Failed to create meeting: ${error}`);
    }
  }
}
