export interface PlayerScoreRow {
  playerName?: string;
  hole1?: number; hole2?: number; hole3?: number; hole4?: number; hole5?: number;
  hole6?: number; hole7?: number; hole8?: number; hole9?: number;
  hole10?: number; hole11?: number; hole12?: number; hole13?: number; hole14?: number;
  hole15?: number; hole16?: number; hole17?: number; hole18?: number;
  front9?: number;
  back9?: number;
  totalScore?: number;
  netScore?: number;
  gamePoint?: number;
}

export interface RewardRow {
  rewardName?: string;
  rewardDesc?: string;
  rewardStory?: string;
  playerName?: string;
  displayOrder?: number;
  rewardGroup?: string;
}

export interface EventScoreDetail {
  eventId?: number;
  eventName?: string;
  eventDate?: string;
  courseName?: string;
  scores?: PlayerScoreRow[];
  rewards?: RewardRow[];
}

export interface StatEntry { name: string; count: number; }
export interface GameStats { eagles: StatEntry[]; birdies: StatEntry[]; pars: StatEntry[]; }
