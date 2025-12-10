import { Link } from "react-router-dom";
import { Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <div className="mb-8">
          <div className="text-9xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text mb-4">
            404
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto">
            The page you're looking for has wandered off to another dimension. Let's get you back to the games!
          </p>
        </div>

        {/* Action button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
        >
          <Home className="w-5 h-5" />
          Back to PlayHub
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
