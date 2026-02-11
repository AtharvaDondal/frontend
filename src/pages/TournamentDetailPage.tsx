import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Swords, Clock, Crown } from "lucide-react";
import {
  getTournaments,
  getStandings,
  getMatches,
  enrollPlayer,
  createRound,
  updateMatchResult,
  getPlayers,
} from "@/lib/api";
import type { Enrollment, Match, Player, Tournament } from "@/types";

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [standings, setStandings] = useState<Enrollment[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState("");

  const fetchData = async () => {
    if (!id) return;
    try {
      const [tourRes, standRes, matchRes, playerRes] = await Promise.all([
        getTournaments(),
        getStandings(id),
        getMatches(id),
        getPlayers(),
      ]);
      setTournament(tourRes.data.find((t: Tournament) => t._id === id));
      setStandings(standRes.data);
      setMatches(matchRes.data);
      setPlayers(
        playerRes.data.filter(
          (p: Player) =>
            !tourRes.data
              .find((t: Tournament) => t._id === id)
              ?.players.some((tp: Player) => tp._id === p._id),
        ),
      );
    } catch (error) {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEnroll = async () => {
    if (!id || !selectedPlayer) return;
    try {
      await enrollPlayer(id, selectedPlayer);
      setIsEnrollOpen(false);
      setSelectedPlayer("");
      fetchData();
    } catch (error) {
      alert("Failed to enroll player");
    }
  };

  const handleCreateRound = async () => {
    if (!id) return;
    try {
      const response = await createRound(id);
      alert(response.data.message || "New round created!");
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create round");
    }
  };

  const handleMatchResult = async (
    matchId: string,
    result: string,
    duration: number,
  ) => {
    try {
      await updateMatchResult(matchId, { result, duration });
      fetchData();
    } catch (error) {
      alert("Failed to update match");
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!tournament)
    return <div className="text-center py-8">Tournament not found</div>;

  const currentRoundMatches = matches.filter(
    (m) => m.round === tournament.currentRound,
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {tournament.name}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge
              variant={
                tournament.status === "ongoing" ? "default" : "secondary"
              }
            >
              {tournament.status}
            </Badge>
            <span className="text-slate-600">
              Round {tournament.currentRound} of {tournament.maxRounds}
            </span>
            <span className="text-slate-600">
              {tournament.players.length} players
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsEnrollOpen(true)} variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Enroll Player
          </Button>
          <Button onClick={handleCreateRound}>
            <Swords className="w-4 h-4 mr-2" />
            Start Next Round
          </Button>
        </div>
      </div>

      <Tabs defaultValue="standings" className="w-full">
        <TabsList>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="current">Current Round</TabsTrigger>
        </TabsList>

        <TabsContent value="standings" className="space-y-4">
          <div className="bg-white rounded-lg shadow border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Matches</TableHead>
                  <TableHead>Wins</TableHead>
                  <TableHead>Byes</TableHead>
                  <TableHead>Total Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((standing, index) => (
                  <TableRow key={standing._id}>
                    <TableCell className="font-medium">
                      {index === 0 && (
                        <Crown className="w-5 h-5 text-yellow-500 inline mr-1" />
                      )}
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {standing.player.name}
                    </TableCell>
                    <TableCell className="text-lg font-bold text-blue-600">
                      {standing.totalPoints}
                    </TableCell>
                    <TableCell>{standing.matchesPlayed}</TableCell>
                    <TableCell>{standing.wins}</TableCell>
                    <TableCell>{standing.byes}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {standing.totalTime}m
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          {Array.from(new Set(matches.map((m) => m.round)))
            .sort()
            .map((round) => (
              <div
                key={round}
                className="bg-white rounded-lg shadow border border-slate-200 p-4"
              >
                <h3 className="font-bold text-lg mb-4">Round {round}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches
                    .filter((m) => m.round === round)
                    .map((match) => (
                      <div key={match._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1 text-center">
                            <div className="font-bold">
                              {match.player1.name}
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {match.player1Score}
                            </div>
                          </div>
                          <div className="px-4 text-slate-400 font-bold">
                            VS
                          </div>
                          <div className="flex-1 text-center">
                            <div className="font-bold">
                              {match.player2.name}
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {match.player2Score}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-center text-sm text-slate-500">
                          {match.result === "pending"
                            ? "In Progress"
                            : `Completed in ${match.duration}m`}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </TabsContent>

        <TabsContent value="current" className="space-y-4">
          {currentRoundMatches.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No matches in current round. Start a new round!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentRoundMatches.map((match) => (
                <div
                  key={match._id}
                  className="bg-white rounded-lg shadow border border-slate-200 p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex-1 text-center">
                      <div className="font-bold text-lg">
                        {match.player1.name}
                      </div>
                    </div>
                    <div className="px-4 font-bold text-slate-400">VS</div>
                    <div className="flex-1 text-center">
                      <div className="font-bold text-lg">
                        {match.player2.name}
                      </div>
                    </div>
                  </div>

                  {match.result === "pending" ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleMatchResult(match._id, "player1-win", 30)
                          }
                        >
                          {match.player1.name} Wins
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleMatchResult(match._id, "draw", 45)
                          }
                        >
                          Draw
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleMatchResult(match._id, "player2-win", 30)
                          }
                        >
                          {match.player2.name} Wins
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <input
                          type="number"
                          placeholder="Duration (minutes)"
                          className="border rounded px-2 py-1 text-sm w-full"
                          id={`duration-${match._id}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-green-600 font-medium">
                      {match.result === "player1-win"
                        ? match.player1.name
                        : match.result === "player2-win"
                          ? match.player2.name
                          : "Draw"}{" "}
                      - {match.duration}m
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Enroll Player Dialog */}
      <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Player in Tournament</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-2">
              {players.map((player) => (
                <div
                  key={player._id}
                  className={`p-3 border rounded cursor-pointer hover:bg-slate-50 ${
                    selectedPlayer === player._id
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                  onClick={() => setSelectedPlayer(player._id)}
                >
                  <div className="font-medium">{player.name}</div>
                  <div className="text-sm text-slate-500">
                    Rating: {player.rating}
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={handleEnroll}
              disabled={!selectedPlayer}
              className="w-full"
            >
              Enroll Selected Player
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
