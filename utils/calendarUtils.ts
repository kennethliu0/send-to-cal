import { CalendarEvent } from "../types";

/**
 * Formats a date string into the Google Calendar format: YYYYMMDDTHHMMSSZ
 * We will use UTC (Z) to ensure global consistency, assuming the input ISO string is valid.
 */
const formatDateForUrl = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().replace(/[-:.]/g, '').split('Z')[0] + 'Z';
};

export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const baseUrl = "https://calendar.google.com/calendar/render";
  const params = new URLSearchParams();

  params.append("action", "TEMPLATE");
  params.append("text", event.title);
  
  const start = formatDateForUrl(event.startDate);
  const end = formatDateForUrl(event.endDate);
  
  if (start && end) {
    params.append("dates", `${start}/${end}`);
  }

  if (event.description) {
    params.append("details", event.description);
  }

  if (event.location) {
    params.append("location", event.location);
  }

  return `${baseUrl}?${params.toString()}`;
};

export const generateICalData = (event: CalendarEvent): string => {
  const formatDate = (isoDateString: string): string => {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().replace(/[-:.]/g, '').split('Z')[0] + 'Z';
  };

  const escapeText = (text: string) => {
    if (!text) return '';
    return text.replace(/\\/g, '\\\\')
               .replace(/;/g, '\\;')
               .replace(/,/g, '\\,')
               .replace(/\n/g, '\\n');
  };

  const start = formatDate(event.startDate);
  const end = formatDate(event.endDate);
  const now = formatDate(new Date().toISOString());
  // Generate a simple unique ID
  const uid = crypto.randomUUID ? crypto.randomUUID() : `event-${Date.now()}@sendtocal`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SendToCal//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return lines.join('\r\n');
};