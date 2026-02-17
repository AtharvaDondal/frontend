import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Eye, Users } from "lucide-react";
import { getTournaments, createTournament, deleteTournament } from "@/lib/api";
import type { Tournament } from "@/types";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    maxRounds: 7,
  });

  const fetchTournaments = async () => {
    try {
      const response = await getTournaments();
      setTournaments(response.data);
    } catch (error) {
      console.error("Failed to fetch tournaments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTournament({
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
      });
      setIsOpen(false);
      setFormData({ name: "", description: "", startDate: "", maxRounds: 7 });
      fetchTournaments();
    } catch (error) {
      console.error("Failed to create tournament");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteTournament(id);
      fetchTournaments();
    } catch (error) {
      console.log("Failed to delete tournament", error);
      console.error("Delete failed");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Tournament Management
          </h1>
          <p className="text-slate-600 mt-1">
            Create and manage chess tournaments
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tournament</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tournament Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxRounds">Max Rounds</Label>
                <Input
                  id="maxRounds"
                  type="number"
                  min={1}
                  max={20}
                  value={formData.maxRounds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxRounds: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Tournament
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <div
            key={tournament._id}
            className="bg-white rounded-lg shadow border border-slate-200 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {tournament.name}
                </h3>
                <Badge className={`mt-2 ${getStatusColor(tournament.status)}`}>
                  {tournament.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Link to={`/tournaments/${tournament._id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(tournament._id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-4">
              {tournament.description}
            </p>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {tournament.players.length} players
              </div>
              <div>
                Round {tournament.currentRound} / {tournament.maxRounds}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                Starts: {new Date(tournament.startDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
