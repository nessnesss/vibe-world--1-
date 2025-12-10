import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
  paused?: boolean;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

export function Timer({
  initialSeconds,
  onTimeUp,
  paused = false,
  size = "medium",
  showLabel = true,
}: TimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  useEffect(() => {
    setSecondsRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (paused || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paused, onTimeUp]);

  const isWarning = secondsRemaining <= 10 && secondsRemaining > 0;
  const isDanger = secondsRemaining < 5;

  const sizeClasses = {
    small: "text-lg",
    medium: "text-3xl",
    large: "text-5xl",
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const displayTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-2">
      {showLabel && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Time Remaining</span>
        </div>
      )}
      <div
        className={`font-bold font-mono transition-colors duration-300 ${sizeClasses[size]} ${
          isDanger
            ? "text-red-500"
            : isWarning
              ? "text-yellow-500"
              : "text-green-400"
        }`}
      >
        {displayTime}
      </div>
      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isDanger
              ? "bg-red-500"
              : isWarning
                ? "bg-yellow-500"
                : "bg-green-500"
          }`}
          style={{
            width: `${(secondsRemaining / initialSeconds) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
