import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Brain, Palette, Users, Trophy, Gamepad2 } from "lucide-react";

export default function Index() {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  const games = [
    {
      id: "mindmaze",
      name: "MindMaze",
      description: "Collaborative puzzle game - Solve enigmas together under pressure",
      icon: Brain,
      color: "from-purple-600 to-blue-600",
      accent: "bg-purple-500",
      players: "2-4 Players",
      duration: "15 minutes",
      features: [
        "10 challenging enigmas",
        "Real-time collaboration",
        "Hint system",
        "Cooperative scoring",
      ],
      path: "/mindmaze",
    },
    {
      id: "brainrush",
      name: "BrainRush",
      description: "Competitive quiz game - Race against friends with 500+ questions",
      icon: Zap,
      color: "from-orange-600 to-red-600",
      accent: "bg-orange-500",
      players: "2-4 Players",
      duration: "Varies",
      features: [
        "500+ questions",
        "10 categories",
        "Speed bonuses",
        "Multiple game modes",
      ],
      path: "/brainrush",
    },
    {
      id: "crazydraws",
      name: "CrazyDraws",
      description: "Drawing party game - Draw with crazy constraints and guess creations",
      icon: Palette,
      color: "from-cyan-600 to-teal-600",
      accent: "bg-cyan-500",
      players: "3-4 Players",
      duration: "8 rounds",
      features: [
        "Drawing canvas",
        "Funny constraints",
        "Real-time guessing",
        "Creative expression",
      ],
      path: "/crazydraws",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow" style={{ animationDelay: "2s" }}></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">PlayHub</h1>
            </div>
            <div className="text-sm text-gray-400">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20">
                🎮 Multiplayer Gaming Platform
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10">
        {/* Hero section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Three Epic Games
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Endless Fun
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Challenge your mind, test your knowledge, and express your creativity with our collection of multiplayer games designed for 2-4 players.
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Users className="w-5 h-5" />
              <span>Play with friends • Real-time multiplayer • No installation needed</span>
            </div>
          </div>

          {/* Games grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {games.map((game, index) => {
              const IconComponent = game.icon;
              const isHovered = hoveredGame === game.id;

              return (
                <Link
                  key={game.id}
                  to={game.path}
                  onMouseEnter={() => setHoveredGame(game.id)}
                  onMouseLeave={() => setHoveredGame(null)}
                  className="group relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card background glow */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${game.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
                  ></div>

                  {/* Card container */}
                  <div className="relative h-full rounded-2xl glass-effect overflow-hidden transition-all duration-500 group-hover:border-white/40 group-hover:shadow-2xl group-hover:shadow-purple-500/20">
                    {/* Top accent bar */}
                    <div
                      className={`h-1 w-full bg-gradient-to-r ${game.color}`}
                    ></div>

                    {/* Card content */}
                    <div className="p-8 h-full flex flex-col">
                      {/* Icon */}
                      <div className="mb-6">
                        <div
                          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500`}
                        >
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Title and description */}
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                        {game.name}
                      </h3>
                      <p className="text-gray-400 mb-6 group-hover:text-gray-300 transition-colors">
                        {game.description}
                      </p>

                      {/* Game info */}
                      <div className="space-y-2 mb-6 flex-grow">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{game.players}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Trophy className="w-4 h-4" />
                          <span>{game.duration}</span>
                        </div>
                      </div>

                      {/* Features list */}
                      <div className="space-y-2 mb-8">
                        {game.features.map((feature, i) => (
                          <div
                            key={i}
                            className="text-sm text-gray-400 flex items-start gap-2"
                          >
                            <span className="text-purple-400 mt-1">✓</span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Play button */}
                      <button
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform group-hover:scale-105 ${
                          isHovered
                            ? `bg-gradient-to-r ${game.color} text-white shadow-lg shadow-purple-500/50`
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {isHovered ? "Play Now" : "Select Game"}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Features section */}
          <section className="mt-32 mb-20">
            <h3 className="text-3xl font-bold text-white text-center mb-12">
              Why PlayHub?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "🎮",
                  title: "Instant Play",
                  desc: "No downloads or installations required",
                },
                {
                  icon: "👥",
                  title: "Multiplayer",
                  desc: "Play with friends in real-time",
                },
                {
                  icon: "🚀",
                  title: "Lightning Fast",
                  desc: "Optimized for smooth gameplay",
                },
                {
                  icon: "🌐",
                  title: "Cross-Platform",
                  desc: "Works on desktop, tablet, and mobile",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="glass-effect rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats section */}
          <section className="glass-effect rounded-2xl p-12 mb-20">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text mb-2">
                  3
                </div>
                <p className="text-gray-400">Epic Games</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text mb-2">
                  4
                </div>
                <p className="text-gray-400">Max Players</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text mb-2">
                  ∞
                </div>
                <p className="text-gray-400">Fun</p>
              </div>
            </div>
          </section>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 PlayHub. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <button className="text-gray-400 hover:text-white transition-colors">
                About
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
