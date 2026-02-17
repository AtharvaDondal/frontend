export interface Player {
  _id: string;
  name: string;
  email: string;
  rating: number;
  country: string;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface Tournament {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: "upcoming" | "ongoing" | "completed";
  maxRounds: number;
  currentRound: number;
  players: Player[];
  format: string;
}

export interface Enrollment {
  _id: string;
  tournament: string;
  player: Player;
  status: "active" | "eliminated" | "withdrawn";
  totalPoints: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  totalTime: number;
  byes: number;
}

export interface Match {
  _id: string;
  tournament: string;
  round: number;
  player1: Player;
  player2: Player;
  result: "pending" | "player1-win" | "player2-win" | "draw" | "bye";
  player1Score: number;
  player2Score: number;
  duration: number;
  startedAt: string;
  completedAt?: string;
}
