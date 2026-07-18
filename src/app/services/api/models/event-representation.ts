import { Tee } from 'src/app/services/api/models/tee';

export class EventRepresentation {
  id?: number;
  eventName?: string;
  eventDesc?: string;
  eventDate?: string;
  eventStory?: string;
  status?: string;
  course?: any;
  season?: any;
  player?: any;
  teeList?: Array<Tee>;
  tournamentId?: number;
  tournamentName?: string;
}
