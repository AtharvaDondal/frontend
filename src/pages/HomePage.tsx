import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Users, Swords, Clock, Target } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      title: "Tournament Management",
      description:
        "Create and manage Swiss-system chess tournaments with automatic pairings",
      icon: Trophy,
      href: "/tournaments",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Player Management",
      description:
        "Register players with ratings and track their performance statistics",
      icon: Users,
      href: "/players",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Smart Pairings",
      description:
        "Automatic Swiss pairings with bye handling for odd player counts",
      icon: Swords,
      href: "/tournaments",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const highlights = [
    {
      icon: Target,
      title: "Swiss System",
      desc: "Fair pairings based on score",
    },
    {
      icon: Clock,
      title: "Time Tracking",
      desc: "Track match duration for tiebreaks",
    },
    {
      icon: Trophy,
      title: "Live Standings",
      desc: "Real-time tournament rankings",
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-slate-900 rounded-2xl shadow-lg">
            <Trophy className="h-12 w-12 text-yellow-400" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">
          Chess Tournament
          <span className="block text-blue-600">Manager</span>
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Professional tournament management with Swiss pairings, automatic bye
          handling, and real-time standings.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link to="/tournaments">
            <Button size="lg" className="gap-2">
              <Swords className="h-4 w-4" />
              Start Tournament
            </Button>
          </Link>
          <Link to="/players">
            <Button variant="outline" size="lg">
              Manage Players
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Key Features</h2>
          <p className="text-slate-600 mt-2">
            Everything you need to run professional chess tournaments
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.href} className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-slate-200 group-hover:border-blue-300">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
        <div className="grid md:grid-cols-3 gap-8">
          {highlights.map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <item.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-slate-600 text-sm mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pairing Logic Info */}
      <section className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">
          Smart Pairing Algorithm
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-slate-700">
          <div>
            <h4 className="font-semibold mb-2">Swiss System Rules:</h4>
            <ul className="space-y-2 text-sm">
              <li>• Players paired with similar scores</li>
              <li>• No rematches against same opponent</li>
              <li>• Color balance (alternating white/black)</li>
              <li>• Automatic bye for odd player count</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Tiebreak Criteria:</h4>
            <ul className="space-y-2 text-sm">
              <li>1. Total Points (higher is better)</li>
              <li>2. Total Time (faster wins prioritized)</li>
              <li>3. Number of Byes (fewer is better)</li>
              <li>4. Direct encounter result</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
