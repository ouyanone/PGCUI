import { PlayerScoreRepresentation } from './playerscore-representation';

export class Tee {
  teeName?: string;
  teeDesc?: string;
  teeTime?: string;
  course?: string;
  playerScoreList: Array<PlayerScoreRepresentation>=[];


}
