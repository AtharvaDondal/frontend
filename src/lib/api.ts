import axios from "axios";

interface PlayerData {
  [key: string]: unknown;
}

interface TournamentData {
  [key: string]: unknown;
}

interface MatchResultData {
  [key: string]: unknown;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Players
export const getPlayers = () => api.get("/players");
export const createPlayer = (data: PlayerData) => api.post("/players", data);
export const updatePlayer = (id: string, data: PlayerData) =>
  api.put(`/players/${id}`, data);
export const deletePlayer = (id: string) => api.delete(`/players/${id}`);

// Tournaments
export const getTournaments = () => api.get("/tournaments");
export const createTournament = (data: TournamentData) =>
  api.post("/tournaments", data);
export const updateTournament = (id: string, data: TournamentData) =>
  api.put(`/tournaments/${id}`, data);
export const deleteTournament = (id: string) =>
  api.delete(`/tournaments/${id}`);
export const enrollPlayer = (tournamentId: string, playerId: string) =>
  api.post("/tournaments/enroll", { tournamentId, playerId });
export const getStandings = (tournamentId: string) =>
  api.get(`/tournaments/${tournamentId}/standings`);

export const enrollMultiplePlayers = (
  tournamentId: string,
  playerIds: string[],
) => api.post("/tournaments/enroll-multiple", { tournamentId, playerIds });

// Matches
export const getMatches = (tournamentId: string) =>
  api.get(`/matches/tournament/${tournamentId}`);
export const createRound = (tournamentId: string) =>
  api.post(`/matches/tournament/${tournamentId}/round`);
export const updateMatchResult = (matchId: string, data: MatchResultData) =>
  api.put(`/matches/${matchId}/result`, data);
