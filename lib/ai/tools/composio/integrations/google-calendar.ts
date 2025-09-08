import { createComposioTool } from '../base';
import { registerComposioTool } from '../tool-manager';
import { composioAuthManager } from '@/lib/composio/auth-manager';
import { z } from 'zod';

// Create Event
export const googleCalendarCreateEvent = createComposioTool({
  name: 'googleCalendarCreateEvent',
  description:
    'Create a calendar event in Google Calendar. Use this when the user wants to schedule an event.',
  inputSchema: z.object({
    attendees: z
      .array(z.string())
      .nullable()
      .optional()
      .describe('List of attendee emails (strings).'),
    calendar_id: z
      .string()
      .optional()
      .default('primary')
      .describe(
        "Target calendar: 'primary' for the user's main calendar, or the calendar's email address.",
      ),
    create_meeting_room: z
      .boolean()
      .nullable()
      .optional()
      .describe(
        "If true, a Google Meet link is created and added to the event. CRITICAL: As of 2024, this REQUIRES a paid Google Workspace account ($13+/month). Personal Gmail accounts will fail with 'Invalid conference type value' error. Solutions: 1) Upgrade to Workspace, 2) Use domain-wide delegation with Workspace user, 3) Use the new Google Meet REST API, or 4) Create events without conferences. See https://github.com/googleapis/google-api-nodejs-client/issues/3234",
      ),
    description: z
      .string()
      .nullable()
      .optional()
      .describe('Description of the event. Can contain HTML. Optional.'),
    eventType: z
      .enum([
        'birthday',
        'default',
        'focusTime',
        'outOfOffice',
        'workingLocation',
      ])
      .optional()
      .default('default')
      .describe(
        "Type of the event, immutable post-creation. Supported types: 'birthday' (all-day with annual recurrence), 'default' (regular event), 'focusTime' (focus-time event), 'outOfOffice' (out-of-office event), 'workingLocation' (working location event). Note: 'fromGmail' events cannot be created via API.",
      ),
    event_duration_hour: z
      .number()
      .min(0)
      .max(24)
      .optional()
      .default(0)
      .describe(
        'Number of hours (0-24). Increase by 1 here rather than passing 60 in `event_duration_minutes`',
      ),
    event_duration_minutes: z
      .number()
      .min(0)
      .max(59)
      .optional()
      .default(30)
      .describe(
        'Duration in minutes (0-59 ONLY). NEVER use 60+ minutes - use event_duration_hour=1 instead. Maximum value is 59.',
      ),
    exclude_organizer: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'If True, the organizer will NOT be added as an attendee. Default is False (organizer is included).',
      ),
    guestsCanInviteOthers: z
      .boolean()
      .nullable()
      .optional()
      .describe(
        'Whether attendees other than the organizer can invite others to the event.',
      ),
    guestsCanSeeOtherGuests: z
      .boolean()
      .nullable()
      .optional()
      .describe(
        "Whether attendees other than the organizer can see who the event's attendees are.",
      ),
    guests_can_modify: z
      .boolean()
      .optional()
      .default(false)
      .describe('If True, guests can modify the event.'),
    location: z
      .string()
      .nullable()
      .optional()
      .describe('Geographic location of the event as free-form text.'),
    recurrence: z
      .array(z.string())
      .nullable()
      .optional()
      .describe(
        'List of RRULE, EXRULE, RDATE, EXDATE lines for recurring events. Supported frequencies are DAILY, WEEKLY, MONTHLY, YEARLY.',
      ),
    send_updates: z
      .boolean()
      .nullable()
      .optional()
      .describe('Defaults to True. Whether to send updates to the attendees.'),
    start_datetime: z
      .string()
      .describe(
        "Naive date/time (YYYY-MM-DDTHH:MM:SS) with NO offsets or Z. e.g. '2025-01-16T13:00:00'",
      ),
    summary: z
      .string()
      .nullable()
      .optional()
      .describe('Summary (title) of the event.'),
    timezone: z
      .string()
      .nullable()
      .optional()
      .describe(
        "IANA timezone name (e.g., 'America/New_York'). Required if datetime is naive. If datetime includes timezone info (Z or offset), this field is optional and defaults to UTC.",
      ),
    transparency: z
      .enum(['opaque', 'transparent'])
      .optional()
      .default('opaque')
      .describe("'opaque' (busy) or 'transparent' (available)."),
    visibility: z
      .enum(['default', 'public', 'private', 'confidential'])
      .optional()
      .default('default')
      .describe(
        "Event visibility: 'default', 'public', 'private', or 'confidential'.",
      ),
  }),
  integrationName: 'Google Calendar',
  composioToolName: 'GOOGLECALENDAR_CREATE_EVENT',
  execute: async (
    {
      attendees,
      calendar_id,
      create_meeting_room,
      description,
      eventType,
      event_duration_hour,
      event_duration_minutes,
      exclude_organizer,
      guestsCanInviteOthers,
      guestsCanSeeOtherGuests,
      guests_can_modify,
      location,
      recurrence,
      send_updates,
      start_datetime,
      summary,
      timezone,
      transparency,
      visibility,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      attendees,
      calendar_id,
      create_meeting_room,
      description,
      eventType,
      event_duration_hour,
      event_duration_minutes,
      exclude_organizer,
      guestsCanInviteOthers,
      guestsCanSeeOtherGuests,
      guests_can_modify,
      location,
      recurrence,
      send_updates,
      start_datetime,
      summary,
      timezone,
      transparency,
      visibility,
    });

    return {
      success: result.successful,
      message: result.successful
        ? 'Calendar event created successfully'
        : result.error,
      data: result.data,
    };
  },
});

registerComposioTool({
  name: 'googleCalendarCreateEvent',
  tool: googleCalendarCreateEvent,
  integrationName: 'Google Calendar',
  composioToolName: 'GOOGLECALENDAR_CREATE_EVENT',
});

// List Events
export const googleCalendarListEvents = createComposioTool({
  name: 'googleCalendarListEvents',
  description: 'List calendar events from Google Calendar.',
  inputSchema: z.object({
    calendarId: z
      .string()
      .describe(
        'Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword.',
      ),
    alwaysIncludeEmail: z
      .boolean()
      .nullable()
      .optional()
      .describe('Deprecated and ignored.'),
    eventTypes: z
      .string()
      .nullable()
      .optional()
      .describe(
        'Event types to return. Optional. This parameter can be repeated multiple times to return events of different types. If unset, returns all event types. Acceptable values are: "birthday", "default", "focusTime", "fromGmail", "outOfOffice", "workingLocation".',
      ),
    iCalUID: z
      .string()
      .nullable()
      .optional()
      .describe(
        'Specifies an event ID in the iCalendar format to be provided in the response. Optional. Use this if you want to search for an event by its iCalendar ID.',
      ),
    maxAttendees: z
      .number()
      .nullable()
      .optional()
      .describe(
        'The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned. Optional.',
      ),
    maxResults: z
      .number()
      .nullable()
      .optional()
      .describe(
        'Maximum number of events returned on one result page. The number of events in the resulting page may be less than this value, or none at all, even if there are more events matching the query. Incomplete pages can be detected by a non-empty nextPageToken field in the response. By default the value is 250 events. The page size can never be larger than 2500 events. Optional.',
      ),
    orderBy: z
      .string()
      .nullable()
      .optional()
      .describe(
        'The order of the events returned in the result. Optional. The default is an unspecified, stable order. Acceptable values are: "startTime", "updated".',
      ),
    pageToken: z
      .string()
      .nullable()
      .optional()
      .describe('Token specifying which result page to return. Optional.'),
    privateExtendedProperty: z
      .string()
      .nullable()
      .optional()
      .describe(
        'Extended properties constraint specified as propertyName=value. Matches only private properties. This parameter might be repeated multiple times to return events that match all given constraints.',
      ),
    q: z
      .string()
      .nullable()
      .optional()
      .describe(
        'Free text search terms to find events that match these terms in various fields. Optional.',
      ),
    sharedExtendedProperty: z
      .string()
      .nullable()
      .optional()
      .describe(
        'Extended properties constraint specified as propertyName=value. Matches only shared properties. This parameter might be repeated multiple times to return events that match all given constraints.',
      ),
    showDeleted: z
      .boolean()
      .nullable()
      .optional()
      .describe(
        'Whether to include deleted events (with status equals "cancelled") in the result. Optional. The default is False.',
      ),
    showHiddenInvitations: z
      .boolean()
      .nullable()
      .optional()
      .describe(
        'Whether to include hidden invitations in the result. Optional. The default is False.',
      ),
    singleEvents: z
      .boolean()
      .nullable()
      .optional()
      .describe(
        'Whether to expand recurring events into instances and only return single one-off events and instances of recurring events. Optional. The default is False.',
      ),
    syncToken: z
      .string()
      .nullable()
      .optional()
      .describe(
        'Token obtained from the nextSyncToken field returned on the last page of results from the previous list request. Optional. The default is to return all entries.',
      ),
    timeMax: z
      .string()
      .nullable()
      .optional()
      .describe(
        "Upper bound (exclusive) for an event's start time to filter by. Optional. The default is not to filter by start time. Must be an RFC3339 timestamp with mandatory time zone offset, for example, 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z. Milliseconds may be provided but are ignored. If timeMin is set, timeMax must be greater than timeMin.",
      ),
    timeMin: z
      .string()
      .nullable()
      .optional()
      .describe(
        "Lower bound (exclusive) for an event's end time to filter by. Optional. The default is not to filter by end time. Must be an RFC3339 timestamp with mandatory time zone offset, for example, 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z. Milliseconds may be provided but are ignored. If timeMax is set, timeMin must be smaller than timeMax.",
      ),
    timeZone: z
      .string()
      .nullable()
      .optional()
      .describe(
        "Time zone used in the response. Optional. The default is the user's primary time zone.",
      ),
    updatedMin: z
      .string()
      .nullable()
      .optional()
      .describe(
        "Lower bound for an event's last modification time (as a RFC3339 timestamp) to filter by. When specified, entries deleted since this time will always be included regardless of showDeleted. Optional. The default is not to filter by last modification time.",
      ),
  }),
  integrationName: 'Google Calendar',
  composioToolName: 'GOOGLECALENDAR_EVENTS_LIST',
  execute: async (
    {
      calendarId,
      alwaysIncludeEmail,
      eventTypes,
      iCalUID,
      maxAttendees,
      maxResults,
      orderBy,
      pageToken,
      privateExtendedProperty,
      q,
      sharedExtendedProperty,
      showDeleted,
      showHiddenInvitations,
      singleEvents,
      syncToken,
      timeMax,
      timeMin,
      timeZone,
      updatedMin,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      calendarId,
      alwaysIncludeEmail,
      eventTypes,
      iCalUID,
      maxAttendees,
      maxResults,
      orderBy,
      pageToken,
      privateExtendedProperty,
      q,
      sharedExtendedProperty,
      showDeleted,
      showHiddenInvitations,
      singleEvents,
      syncToken,
      timeMax,
      timeMin,
      timeZone,
      updatedMin,
    });

    return {
      success: result.successful,
      message: result.successful ? `Found events successfully` : result.error,
      data: result.data,
    };
  },
});

registerComposioTool({
  name: 'googleCalendarListEvents',
  tool: googleCalendarListEvents,
  integrationName: 'Google Calendar',
  composioToolName: 'GOOGLECALENDAR_EVENTS_LIST',
});

// Update Event
export const googleCalendarUpdateEvent = createComposioTool({
  name: 'googleCalendarUpdateEvent',
  description: 'Update an existing calendar event in Google Calendar.',
  inputSchema: z.object({
    event_id: z
      .string()
      .describe('The unique identifier of the event to be updated.'),
    start_datetime: z
      .string()
      .describe(
        "Naive date/time (YYYY-MM-DDTHH:MM:SS) with NO offsets or Z. e.g. '2025-01-16T13:00:00'",
      ),
    attendees: z
      .array(z.string())
      .nullable()
      .optional()
      .describe('List of attendee emails (strings).'),
    calendar_id: z
      .string()
      .optional()
      .default('primary')
      .describe(
        "Identifier of the Google Calendar where the event resides. The value 'primary' targets the user's primary calendar.",
      ),
    create_meeting_room: z
      .boolean()
      .nullable()
      .optional()
      .describe(
        "If true, a Google Meet link is created and added to the event. CRITICAL: As of 2024, this REQUIRES a paid Google Workspace account ($13+/month). Personal Gmail accounts will fail with 'Invalid conference type value' error. Solutions: 1) Upgrade to Workspace, 2) Use domain-wide delegation with Workspace user, 3) Use the new Google Meet REST API, or 4) Create events without conferences. See https://github.com/googleapis/google-api-nodejs-client/issues/3234",
      ),
    description: z
      .string()
      .nullable()
      .optional()
      .describe('Description of the event. Can contain HTML. Optional.'),
    eventType: z
      .enum([
        'birthday',
        'default',
        'focusTime',
        'outOfOffice',
        'workingLocation',
      ])
      .optional()
      .default('default')
      .describe(
        "Type of the event, immutable post-creation. Supported types: 'birthday' (all-day with annual recurrence), 'default' (regular event), 'focusTime' (focus-time event), 'outOfOffice' (out-of-office event), 'workingLocation' (working location event). Note: 'fromGmail' events cannot be created via API.",
      ),
    event_duration_hour: z
      .number()
      .min(0)
      .max(24)
      .optional()
      .default(0)
      .describe(
        'Number of hours (0-24). Increase by 1 here rather than passing 60 in `event_duration_minutes`',
      ),
    event_duration_minutes: z
      .number()
      .min(0)
      .max(59)
      .optional()
      .default(30)
      .describe(
        'Duration in minutes (0-59 ONLY). NEVER use 60+ minutes - use event_duration_hour=1 instead. Maximum value is 59.',
      ),
    guestsCanInviteOthers: z
      .boolean()
      .nullable()
      .optional()
      .describe(
        'Whether attendees other than the organizer can invite others to the event.',
      ),
    guestsCanSeeOtherGuests: z
      .boolean()
      .nullable()
      .optional()
      .describe(
        "Whether attendees other than the organizer can see who the event's attendees are.",
      ),
    guests_can_modify: z
      .boolean()
      .optional()
      .default(false)
      .describe('If True, guests can modify the event.'),
    location: z
      .string()
      .nullable()
      .optional()
      .describe('Geographic location of the event as free-form text.'),
    recurrence: z
      .array(z.string())
      .nullable()
      .optional()
      .describe(
        'List of RRULE, EXRULE, RDATE, EXDATE lines for recurring events. Supported frequencies are DAILY, WEEKLY, MONTHLY, YEARLY.',
      ),
    send_updates: z
      .boolean()
      .nullable()
      .optional()
      .describe('Defaults to True. Whether to send updates to the attendees.'),
    summary: z
      .string()
      .nullable()
      .optional()
      .describe('Summary (title) of the event.'),
    timezone: z
      .string()
      .nullable()
      .optional()
      .describe(
        "IANA timezone name (e.g., 'America/New_York'). Required if datetime is naive. If datetime includes timezone info (Z or offset), this field is optional and defaults to UTC.",
      ),
    transparency: z
      .enum(['opaque', 'transparent'])
      .optional()
      .default('opaque')
      .describe("'opaque' (busy) or 'transparent' (available)."),
    visibility: z
      .enum(['default', 'public', 'private', 'confidential'])
      .optional()
      .default('default')
      .describe(
        "Event visibility: 'default', 'public', 'private', or 'confidential'.",
      ),
  }),
  integrationName: 'Google Calendar',
  composioToolName: 'GOOGLECALENDAR_UPDATE_EVENT',
  execute: async (
    {
      event_id,
      start_datetime,
      attendees,
      calendar_id,
      create_meeting_room,
      description,
      eventType,
      event_duration_hour,
      event_duration_minutes,
      guestsCanInviteOthers,
      guestsCanSeeOtherGuests,
      guests_can_modify,
      location,
      recurrence,
      send_updates,
      summary,
      timezone,
      transparency,
      visibility,
    },
    composioTool,
    userId,
  ) => {
    const result = await composioTool.execute({
      event_id,
      start_datetime,
      attendees,
      calendar_id,
      create_meeting_room,
      description,
      eventType,
      event_duration_hour,
      event_duration_minutes,
      guestsCanInviteOthers,
      guestsCanSeeOtherGuests,
      guests_can_modify,
      location,
      recurrence,
      send_updates,
      summary,
      timezone,
      transparency,
      visibility,
    });

    return {
      success: result.successful,
      message: result.successful ? 'Event updated successfully' : result.error,
      data: result.data,
    };
  },
});

registerComposioTool({
  name: 'googleCalendarUpdateEvent',
  tool: googleCalendarUpdateEvent,
  integrationName: 'Google Calendar',
  composioToolName: 'GOOGLECALENDAR_UPDATE_EVENT',
});

// Delete Event
export const googleCalendarDeleteEvent = createComposioTool({
  name: 'googleCalendarDeleteEvent',
  description: 'Delete a calendar event from Google Calendar.',
  inputSchema: z.object({
    eventId: z
      .string()
      .describe(
        'Unique identifier of the event to delete, typically obtained upon event creation.',
      ),
    calendarId: z
      .string()
      .optional()
      .default('primary')
      .describe(
        "Identifier of the Google Calendar (e.g., email address, specific ID, or `primary` for the authenticated user's main calendar) from which the event will be deleted.",
      ),
  }),
  integrationName: 'Google Calendar',
  composioToolName: 'GOOGLECALENDAR_DELETE_EVENT',
  execute: async ({ eventId, calendarId }, composioTool, userId) => {
    const result = await composioTool.execute({
      event_id: eventId,
      calendar_id: calendarId,
    });

    return {
      success: result.successful,
      message: result.successful ? 'Event deleted successfully' : result.error,
      data: result.data,
    };
  },
});

// Authentication tool for Google Calendar
export const authenticateGoogleCalendar = createComposioTool({
  name: 'authenticateGoogleCalendar',
  description:
    'Initiate authentication with Google Calendar to enable calendar functionality',
  inputSchema: z.object({}),
  integrationName: 'Google Calendar',
  composioToolName: 'GOOGLECALENDAR_EVENTS_LIST',
  execute: async (params, composioTool, userId) => {
    try {
      const authRequest = await composioAuthManager.initiateAuth(
        userId,
        'Google Calendar',
      );

      return {
        success: true,
        message: `🔗 **Google Calendar Authentication Required**

To use Google Calendar features, you need to authenticate with your Google account first.

**Authentication URL:** ${authRequest.redirectUrl}

Please click the authentication button below to connect your Google account. After authentication, you can retry your original request.`,
        data: {
          requiresAuth: true,
          authUrl: authRequest.redirectUrl,
          integrationName: 'Google Calendar',
          authToolName: 'authenticateGoogleCalendar',
        },
      };
    } catch (error) {
      console.error(`❌ Error initiating auth for Google Calendar:`, error);
      return {
        success: false,
        message:
          '❌ **Authentication Failed**\n\nFailed to initiate Google Calendar authentication. Please try again or contact support.',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
});

registerComposioTool({
  name: 'authenticateGoogleCalendar',
  tool: authenticateGoogleCalendar,
  integrationName: 'Google Calendar',
  composioToolName: 'GOOGLECALENDAR_CREATE_EVENT',
});
