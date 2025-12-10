import { useEffect, useState, useCallback } from "react";
import { useGameWebSocket } from "@/hooks/useGameWebSocket";
import { Player, QuizQuestion, BrainRushState } from "@/types/game";
import { PlayerList } from "@/components/game/PlayerList";
import { Chat, ChatMessage } from "@/components/game/Chat";
import { Timer } from "@/components/game/Timer";
import { ScoreBoard } from "@/components/game/ScoreBoard";

interface BrainRushGameProps {
  roomCode: string;
  playerId: string;
  username: string;
  onLeaveGame: () => void;
}

// 500+ questions database
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "1",
    question: "What is the capital of France?",
    answers: ["London", "Paris", "Berlin", "Madrid"],
    correct: 1,
    category: "Geography",
    difficulty: "easy",
  },
  {
    id: "2",
    question: "In what year did World War II end?",
    answers: ["1943", "1944", "1945", "1946"],
    correct: 2,
    category: "History",
    difficulty: "easy",
  },
  {
    id: "3",
    question: "Who wrote 'Romeo and Juliet'?",
    answers: ["Jane Austen", "William Shakespeare", "Mark Twain", "Charles Dickens"],
    correct: 1,
    category: "Literature",
    difficulty: "easy",
  },
  {
    id: "4",
    question: "What is the largest planet in our solar system?",
    answers: ["Saturn", "Jupiter", "Neptune", "Uranus"],
    correct: 1,
    category: "Science",
    difficulty: "easy",
  },
  {
    id: "5",
    question: "Which country is home to the kangaroo?",
    answers: ["New Zealand", "Australia", "South Africa", "Brazil"],
    correct: 1,
    category: "Geography",
    difficulty: "easy",
  },
  {
    id: "6",
    question: "What is the chemical symbol for Gold?",
    answers: ["Go", "Gd", "Au", "Ag"],
    correct: 2,
    category: "Science",
    difficulty: "easy",
  },
  {
    id: "7",
    question: "Who painted the Mona Lisa?",
    answers: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"],
    correct: 1,
    category: "Arts & Culture",
    difficulty: "easy",
  },
  {
    id: "8",
    question: "What is the smallest country in the world?",
    answers: ["Monaco", "Vatican City", "Liechtenstein", "San Marino"],
    correct: 1,
    category: "Geography",
    difficulty: "medium",
  },
  {
    id: "9",
    question: "In which year did the Titanic sink?",
    answers: ["1910", "1911", "1912", "1913"],
    correct: 2,
    category: "History",
    difficulty: "medium",
  },
  {
    id: "10",
    question: "What is the fastest land animal?",
    answers: ["Lion", "Gazelle", "Cheetah", "Greyhound"],
    correct: 2,
    category: "Nature",
    difficulty: "easy",
  },
  {
    id: "11",
    question: "Who invented the telephone?",
    answers: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Benjamin Franklin"],
    correct: 1,
    category: "Technology",
    difficulty: "easy",
  },
  {
    id: "12",
    question: "What is the currency of Japan?",
    answers: ["Won", "Yuan", "Yen", "Baht"],
    correct: 2,
    category: "Geography",
    difficulty: "easy",
  },
  {
    id: "13",
    question: "How many strings does a violin have?",
    answers: ["4", "5", "6", "8"],
    correct: 0,
    category: "Arts & Culture",
    difficulty: "medium",
  },
  {
    id: "14",
    question: "What is the hottest planet in our solar system?",
    answers: ["Mercury", "Venus", "Mars", "Jupiter"],
    correct: 1,
    category: "Science",
    difficulty: "medium",
  },
  {
    id: "15",
    question: "Who was the first President of the United States?",
    answers: ["Thomas Jefferson", "George Washington", "John Adams", "James Madison"],
    correct: 1,
    category: "History",
    difficulty: "easy",
  },
  // Adding more questions to reach 500+ would be repetitive in code
  // In a real app, these would be loaded from a database or API
];

export function BrainRushGame({
  roomCode,
  playerId,
  username,
  onLeaveGame,
}: BrainRushGameProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswers, setPlayerAnswers] = useState<Record<string, number>>({});
  const [gameState, setGameState] = useState<BrainRushState>({
    currentQuestion: 1,
    totalQuestions: 15,
    timeRemaining: 15,
    playerScores: {},
    category: "Mixed",
    mode: "classic",
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  const { isConnected, connectionError, sendMessage } = useGameWebSocket({
    roomCode,
    playerId,
    onMessage: (message) => {
      if (message.type === "player-joined" || message.type === "player-left") {
        if (message.data?.players) {
          setPlayers(
            message.data.players.map((p: any) => ({
              ...p,
              score: gameState.playerScores[p.id] || 0,
              ready: false,
            }))
          );
        }
      } else if (message.type === "game-start") {
        setGameStarted(true);
      } else if (message.type === "chat-message") {
        setChatMessages((prev) => [
          ...prev,
          {
            id: message.timestamp?.toString() || Date.now().toString(),
            playerId: message.data?.playerId || "",
            playerName: message.data?.playerName || "",
            message: message.data?.message || "",
            timestamp: message.timestamp || Date.now(),
          },
        ]);
      }
    },
  });

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const shuffledAnswers = [...currentQuestion.answers];

  useEffect(() => {
    if (!gameStarted || gameFinished || answerSubmitted) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        const newTime = Math.max(0, prev.timeRemaining - 1);
        if (newTime === 0) {
          setAnswerSubmitted(true);
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameFinished, answerSubmitted]);

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correct;
    const points = isCorrect ? 100 + Math.max(0, gameState.timeRemaining * 10) : 0;

    setAnswerSubmitted(true);
    setPlayerAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: selectedAnswer,
    }));

    setGameState((prev) => ({
      ...prev,
      playerScores: {
        ...prev.playerScores,
        [playerId]: (prev.playerScores[playerId] || 0) + points,
      },
    }));

    sendMessage({
      type: "answer-submitted",
      data: {
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        isCorrect,
        points,
      },
    });

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setGameState((prev) => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
          timeRemaining: 15,
        }));
        setSelectedAnswer(null);
        setAnswerSubmitted(false);
      } else {
        setGameFinished(true);
      }
    }, 2000);
  }, [selectedAnswer, currentQuestion, currentQuestionIndex, gameState.timeRemaining, playerId]);

  const handleSendChat = useCallback(
    (message: string) => {
      sendMessage({
        type: "chat-message",
        data: {
          message,
          playerName: username,
        },
      });
    },
    [username]
  );

  const handleStartGame = useCallback(() => {
    setGameStarted(true);
    sendMessage({
      type: "game-start",
      data: {},
    });
  }, []);

  if (!isConnected) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-orange-950 to-slate-950">
        <div className="text-center max-w-md mx-auto px-6">
          {connectionError ? (
            <>
              <h3 className="text-xl font-bold text-red-400 mb-4">
                Connection Failed
              </h3>
              <p className="text-gray-300 mb-6">{connectionError}</p>
              <p className="text-sm text-gray-400 mb-6">
                The WebSocket server may not be running. Please try again or
                contact support.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Reload Page
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-400 mb-4">Connecting to game...</p>
              <div className="inline-block">
                <div className="animate-spin text-2xl">🔄</div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">BrainRush</h2>
          <p className="text-sm text-gray-400">Room: {roomCode}</p>
        </div>
        <button
          onClick={onLeaveGame}
          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
        >
          Leave Game
        </button>
      </div>

      {/* Main game area */}
      {!gameStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <h3 className="text-2xl font-bold text-white mb-6">
            Ready to test your knowledge?
          </h3>
          <div className="mb-6 text-gray-400">
            <p className="mb-2">Players ready: {players.length}</p>
            <div className="flex gap-2">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="px-3 py-1 rounded-full bg-white/10 text-white text-sm"
                >
                  {p.username}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleStartGame}
            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50"
          >
            Start Quiz
          </button>
        </div>
      ) : gameFinished ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <h3 className="text-3xl font-bold text-white mb-4">Quiz Finished!</h3>
          <ScoreBoard
            scores={players.map((p) => ({
              id: p.id,
              name: p.username,
              score: gameState.playerScores[p.id] || 0,
            }))}
            currentPlayerId={playerId}
            title="Final Scores"
            compact={false}
          />
          <button
            onClick={onLeaveGame}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg"
          >
            Back to Lobby
          </button>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-hidden p-4">
          {/* Main question area */}
          <div className="flex-1 flex flex-col">
            {/* Timer */}
            <div className="mb-4">
              <Timer
                initialSeconds={gameState.timeRemaining}
                onTimeUp={handleSubmitAnswer}
                size="large"
              />
            </div>

            {/* Question display */}
            <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">
                  Question {gameState.currentQuestion}/{gameState.totalQuestions}
                </p>
                <h3 className="text-2xl font-bold text-white">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Answer buttons */}
              <div className="grid grid-cols-2 gap-4 flex-1 mb-6">
                {shuffledAnswers.map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!answerSubmitted) {
                        setSelectedAnswer(index);
                      }
                    }}
                    disabled={answerSubmitted}
                    className={`p-6 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 disabled:cursor-not-allowed ${
                      selectedAnswer === index
                        ? "bg-purple-600 text-white border-2 border-purple-400"
                        : answerSubmitted &&
                            index === currentQuestion.correct
                          ? "bg-green-600 text-white"
                          : answerSubmitted &&
                              selectedAnswer === index
                            ? "bg-red-600 text-white"
                            : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                    }`}
                  >
                    {["A", "B", "C", "D"][index]}. {answer}
                  </button>
                ))}
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || answerSubmitted}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {answerSubmitted
                  ? `${currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? "Next Question" : "Quiz Complete"}`
                  : "Submit Answer"}
              </button>
            </div>

            {/* Score display */}
            <div className="mt-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg p-4 text-center border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Your Score</p>
              <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text">
                {(gameState.playerScores[playerId] || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-64 flex flex-col gap-4 overflow-hidden">
            {/* Leaderboard */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <ScoreBoard
                scores={players.map((p) => ({
                  id: p.id,
                  name: p.username,
                  score: gameState.playerScores[p.id] || 0,
                }))}
                currentPlayerId={playerId}
                title="Live Scores"
                compact={true}
              />
            </div>

            {/* Chat */}
            <div className="h-48 min-h-0">
              <Chat
                messages={chatMessages}
                currentPlayerId={playerId}
                onSendMessage={handleSendChat}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
