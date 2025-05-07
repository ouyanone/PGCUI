import { PlayerRepresentation } from './player-representation';
import { Tee } from 'src/app/services/api/models/tee';

export class EventRepresentation {
  id?: number;
  eventName?: string;
  eventDesc?: string;
  season?: string;
  course?: string;
  eventDate?: string;
  player: Array<PlayerRepresentation>=[];
  teeList: Array<Tee>=[];

}
