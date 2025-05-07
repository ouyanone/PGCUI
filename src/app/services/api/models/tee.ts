import { PlayerRepresentation } from './player-representation';

export class Tee {
  teeName?: string;
  teeDesc?: string;
  teeTime?: string;
  course?: string;
  teamA: Array<PlayerRepresentation>=[];
  teamB: Array<PlayerRepresentation>=[];
  teamAavghandicap?: number;
  teamAavgScore?: number;

  teamBavghandicap?: number;
  teamBavgScore?: number;
}
