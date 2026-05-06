import { PlayerRepresentation } from './player-representation';
import { EventRepresentation } from './event-representation';

export class RewardRepresentation {
  id?: number;
  rewardName?: string;
  rewardDesc?: string;
  rewardStory?: string;
 

  player?: PlayerRepresentation;
  event?: EventRepresentation;



}
