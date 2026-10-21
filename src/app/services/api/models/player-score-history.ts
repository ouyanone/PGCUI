export interface ScoreHistoryRound {
  eventId?: number;
  eventName?: string;
  eventDate?: string;
  clubName?: string;
  courseName?: string;
  /** Null when the course has no per-hole par, in which case `pars` is null too. */
  coursePar?: number | null;

  gross?: number;
  netScore?: number | null;
  differential?: number | null;
  gamePoint?: number | null;

  /** Real strokes, or the raw offsets from par when `pars` is null. */
  holes?: (number | null)[];
  pars?: (number | null)[] | null;

  outStrokes?: number;
  inStrokes?: number;
  outPar?: number;
  inPar?: number;

  eagles?: number;
  birdies?: number;
  parsMade?: number;
}

export interface PlayerScoreHistory {
  playerId?: number;
  firstName?: string;
  lastName?: string;
  pgcHandicap?: number | null;
  handicap?: number | null;

  roundsPlayed?: number;
  bestGross?: number | null;
  averageGross?: number | null;
  latestGross?: number | null;

  rounds?: ScoreHistoryRound[];
}
