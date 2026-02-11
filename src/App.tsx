import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Trophy, Users, Swords, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

// Pages
import HomePage from "@/pages/HomePage";
import PlayersPage from "@/pages/PlayersPage";
import TournamentsPage from "@/pages/TournamentsPage";
import TournamentDetailPage from "@/pages/TournamentDetailPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-blue-600 mr-2" />
                  <span className="font-bold text-xl text-slate-900">
                    ChessMaster
                  </span>
                </div>
                <div className="flex space-x-4 items-center">
                  <Link to="/">
                    <Button variant="ghost" className="gap-2">
                      <Home className="w-4 h-4" />
                      Home
                    </Button>
                  </Link>
                  <Link to="/players">
                    <Button variant="ghost" className="gap-2">
                      <Users className="w-4 h-4" />
                      Players
                    </Button>
                  </Link>
                  <Link to="/tournaments">
                    <Button variant="ghost" className="gap-2">
                      <Swords className="w-4 h-4" />
                      Tournaments
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/tournaments" element={<TournamentsPage />} />
              <Route
                path="/tournaments/:id"
                element={<TournamentDetailPage />}
              />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
