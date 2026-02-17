import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { Users, Swords, Clock, Crown, CheckSquare, Trophy } from "lucide-react";
import {
  getTournaments,
  getStandings,
  getMatches,
  enrollMultiplePlayers,
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
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

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
      console.error("Failed to fetch data:", error);
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const selectAllPlayers = () => {
    if (selectedPlayers.length === players.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(players.map((p) => p._id));
    }
  };

  const handleEnrollMultiple = async () => {
    if (!id || selectedPlayers.length === 0) return;
    try {
      await enrollMultiplePlayers(id, selectedPlayers);
      setIsEnrollOpen(false);
      setSelectedPlayers([]);
      fetchData();
      alert(`Successfully enrolled ${selectedPlayers.length} players!`);
    } catch (error) {
      console.error("Failed to enroll players:", error);
      alert("Failed to enroll players");
    }
  };

  const handleCreateRound = async () => {
    if (!id) return;
    try {
      const response = await createRound(id);
      alert(response.data.message || "New round created!");
      fetchData();
    } catch (error: unknown) {
      console.log(error);
      alert("Failed to create round");
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
      console.error("Failed to update match result:", error);
      alert("Failed to update match");
    }
  };

  const handleAutoResult = async (matchId: string) => {
    try {
      await updateMatchResult(matchId, { auto: true }); // Send auto: true
      fetchData(); // Refresh to show result
    } catch (error) {
      console.error("Failed to generate auto result:", error);
      alert("Failed to generate auto result");
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!tournament)
    return <div className="text-center py-8">Tournament not found</div>;

  const currentRoundMatches = matches.filter(
    (m) => m.round === tournament.currentRound,
  );

  const isCompleted = tournament.status === "completed";

  // Check if current round has pending matches
  const hasPendingMatches = currentRoundMatches.some(
    (m) => m.result === "pending",
  );

  // Check if max rounds reached
  const isMaxRoundsReached = tournament.currentRound >= tournament.maxRounds;

  // Determine if can start next round
  // const canStartNextRound =
  //   !isCompleted && !hasPendingMatches && !isMaxRoundsReached;

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
            Enroll Players
          </Button>

          {isCompleted ? (
            <Button disabled variant="secondary">
              <Trophy className="w-4 h-4 mr-2" />
              Tournament Completed
            </Button>
          ) : hasPendingMatches ? (
            <Button disabled variant="secondary">
              <Clock className="w-4 h-4 mr-2" />
              Complete Current Round
            </Button>
          ) : isMaxRoundsReached ? (
            <Button disabled variant="secondary">
              <Trophy className="w-4 h-4 mr-2" />
              Max Rounds Reached
            </Button>
          ) : (
            <Button onClick={handleCreateRound}>
              <Swords className="w-4 h-4 mr-2" />
              Start Next Round
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="standings" className="w-full">
        <TabsList>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="current">Current Round</TabsTrigger>
        </TabsList>

        <TabsContent value="standings" className="space-y-4">
          {/* WINNER PODIUM - Show top 3 */}
          {tournament.status !== "upcoming" && standings.length >= 3 ? (
            <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-center mb-6 text-slate-800">
                🏆 Top 3 Winners 🏆
              </h2>

              <div className="flex justify-center items-end gap-4">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-24 bg-gray-300 rounded-t-lg flex items-center justify-center text-3xl">
                    🥈
                  </div>
                  <div className="bg-white border border-gray-200 rounded-b-lg p-2 w-24 text-center -mt-1">
                    <p className="font-bold text-xs truncate">
                      {standings[1].player.name}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {standings[1].totalPoints}
                    </p>
                  </div>
                </div>

                {/* 1st Place - Tallest */}
                <div className="flex flex-col items-center -mt-4">
                  <div className="w-24 h-32 bg-yellow-300 rounded-t-lg flex items-center justify-center text-4xl relative">
                    🥇
                    <Crown className="absolute -top-3 w-6 h-6 text-yellow-600 fill-yellow-600" />
                  </div>
                  <div className="bg-white border-2 border-yellow-300 rounded-b-lg p-2 w-28 text-center -mt-1">
                    <p className="font-bold text-sm truncate">
                      {standings[0].player.name}
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {standings[0].totalPoints}
                    </p>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-orange-300 rounded-t-lg flex items-center justify-center text-3xl">
                    🥉
                  </div>
                  <div className="bg-white border border-orange-200 rounded-b-lg p-2 w-24 text-center -mt-1">
                    <p className="font-bold text-xs truncate">
                      {standings[2].player.name}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {standings[2].totalPoints}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : tournament.status === "upcoming" && standings.length > 0 ? (
            <div className="bg-blue-50 rounded-2xl p-8 mb-6 text-center">
              <Swords className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800">
                Tournament Starting Soon
              </h2>
              <p className="text-slate-600 mt-2">
                {standings.length} players enrolled. Click "Start Next Round" to
                begin!
              </p>
            </div>
          ) : null}
          {/* FULL STANDINGS TABLE */}
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
                  <TableRow
                    key={standing._id}
                    className={
                      standing.status === "eliminated"
                        ? "bg-red-50 opacity-60"
                        : index < 3
                          ? "bg-yellow-50/30"
                          : ""
                    }
                  >
                    <TableCell className="font-medium">
                      {/* Rank with medal for top 3 */}
                      {index === 0 && <span className="text-xl mr-1">🥇</span>}
                      {index === 1 && <span className="text-xl mr-1">🥈</span>}
                      {index === 2 && <span className="text-xl mr-1">🥉</span>}
                      {index > 2 && index + 1}

                      {/* Eliminated badge */}
                      {standing.status === "eliminated" && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Out
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="font-medium">
                      {standing.player.name}
                      {/* Winner badge for 1st place */}
                      {index === 0 && (
                        <Badge className="ml-2 bg-yellow-500 text-white">
                          Champion
                        </Badge>
                      )}
                      {index === 1 && (
                        <Badge className="ml-2 bg-gray-400 text-white">
                          Runner-up
                        </Badge>
                      )}
                      {index === 2 && (
                        <Badge className="ml-2 bg-orange-400 text-white">
                          3rd Place
                        </Badge>
                      )}
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
                      {/*  AUTO RESULT BUTTON HERE */}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full mb-2"
                        onClick={() => handleAutoResult(match._id)}
                      >
                        🎲 Auto Result
                      </Button>

                      <div className="space-y-2">
                        {/* Duration Input - MOVED ABOVE BUTTONS */}
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4" />
                          <input
                            type="number"
                            placeholder="Duration (minutes)"
                            className="border rounded px-2 py-1 text-sm w-full"
                            id={`duration-${match._id}`}
                            defaultValue="30"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById(
                                `duration-${match._id}`,
                              ) as HTMLInputElement;
                              const duration = input?.value
                                ? parseInt(input.value)
                                : 30;
                              handleMatchResult(
                                match._id,
                                "player1-win",
                                duration,
                              );
                            }}
                          >
                            {match.player1.name} Wins
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const input = document.getElementById(
                                `duration-${match._id}`,
                              ) as HTMLInputElement;
                              const duration = input?.value
                                ? parseInt(input.value)
                                : 30;
                              handleMatchResult(match._id, "draw", duration);
                            }}
                          >
                            Draw
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById(
                                `duration-${match._id}`,
                              ) as HTMLInputElement;
                              const duration = input?.value
                                ? parseInt(input.value)
                                : 30;
                              handleMatchResult(
                                match._id,
                                "player2-win",
                                duration,
                              );
                            }}
                          >
                            {match.player2.name} Wins
                          </Button>
                        </div>
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

      {/* Multiple Enrollment Dialog */}
      <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll Players in Tournament</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-sm text-slate-600">
                {selectedPlayers.length} of {players.length} selected
              </span>
              <Button variant="outline" size="sm" onClick={selectAllPlayers}>
                <CheckSquare className="w-4 h-4 mr-2" />
                {selectedPlayers.length === players.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {players.length === 0 ? (
                <p className="text-center text-slate-500 py-4">
                  No available players to enroll
                </p>
              ) : (
                players.map((player) => (
                  <div
                    key={player._id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => togglePlayerSelection(player._id)}
                  >
                    <Checkbox
                      checked={selectedPlayers.includes(player._id)}
                      onCheckedChange={() => togglePlayerSelection(player._id)}
                    />
                    <div className="flex-1">
                      <Label className="font-medium cursor-pointer">
                        {player.name}
                      </Label>
                      <p className="text-sm text-slate-500">
                        Rating: {player.rating} • {player.country}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              onClick={handleEnrollMultiple}
              disabled={selectedPlayers.length === 0}
              className="w-full"
            >
              <Users className="w-4 h-4 mr-2" />
              Enroll {selectedPlayers.length} Player
              {selectedPlayers.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
