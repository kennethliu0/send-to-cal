export interface CalendarEvent {
  title: string;
  startDate: string; // ISO 8601 string
  endDate: string;   // ISO 8601 string
  location: string;
  description: string;
}

export interface ExtractedEventResponse {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}
