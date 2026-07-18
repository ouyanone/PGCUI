import { EventRepresentation } from './event-representation';

export interface TournamentRepresentation {
  id?: number;
  name?: string;
  description?: string;
  season?: any;
  startDate?: string;
  endDate?: string;
  events?: EventRepresentation[];
}
