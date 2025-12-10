import { useRef, useEffect, useState } from "react";
import { Send } from "lucide-react";

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type?: "regular" | "system";
}

interface ChatProps {
  messages: ChatMessage[];
  currentPlayerId: string;
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function Chat({
  messages,
  currentPlayerId,
  onSendMessage,
  disabled = false,
}: ChatProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/5 rounded-xl border border-white/10">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-sm">No messages yet...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.playerId === currentPlayerId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.playerId === currentPlayerId
                    ? "bg-purple-500/20 border border-purple-500/30 text-purple-100"
                    : msg.type === "system"
                      ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-xs italic"
                      : "bg-white/10 border border-white/20 text-gray-200"
                }`}
              >
                {msg.type !== "system" && (
                  <p className="text-xs text-gray-400 mb-1">
                    {msg.playerName}
                  </p>
                )}
                <p className="text-sm break-words">{msg.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-white/10 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={disabled ? "Chat disabled..." : "Type a message..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={disabled || !inputValue.trim()}
            className="px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
