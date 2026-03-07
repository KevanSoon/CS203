"use client";

import { useState, useRef, useEffect } from "react";
import { CartoonButton } from "@/app/components/CartoonButton";
import { Bot, User, X, Plus, ChevronDown } from "lucide-react";
import axios from "axios";
import { useSiteState } from "@/app/store/SiteStore";


interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

interface Thread {
  thread_id: string;
  created_at: string;
}

interface AIChatAssistantProps {
  onClose?: () => void;
}

const WELCOME_MESSAGE: Message = {
  id: 1,
  role: "assistant",
  content: "Hey! I'm your AI study buddy. Ask me anything about the lesson!",
};

export const AIChatAssistant = ({ onClose }: AIChatAssistantProps) => {
  const user = useSiteState((s) => s.user);
  const userId = user?.username || "default_user";

  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(() => crypto.randomUUID());
  const [threads, setThreads] = useState<Thread[]>([]);
  const [showThreads, setShowThreads] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchThreads();
  }, [userId]);

  const fetchThreads = async () => {
    try {
      const { data } = await axios.get(`/api/chat/threads?user_id=${userId}`);
      setThreads(data.threads || []);
    } catch {
      // silently fail
    }
  };

  const loadThread = async (selectedThreadId: string) => {
    setThreadId(selectedThreadId);
    setShowThreads(false);
    try {
      const { data } = await axios.get(
        `/api/chat/history?thread_id=${selectedThreadId}&user_id=${userId}`
      );
      const history: Message[] = (data.messages || []).map(
        (msg: { role: string; content: string }, i: number) => ({
          id: i + 1,
          role: msg.role === "human" ? "user" : "assistant",
          content: msg.content,
        })
      );
      setMessages(history.length > 0 ? history : [WELCOME_MESSAGE]);
    } catch {
      setMessages([WELCOME_MESSAGE]);
    }
  };

  const startNewChat = () => {
    setThreadId(crypto.randomUUID());
    setMessages([WELCOME_MESSAGE]);
    setShowThreads(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
    };

    const thinkingMessage: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: "Thinking...",
    };

    setMessages((prev) => [...prev, userMessage, thinkingMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post("/api/chat", {
        message: userMessage.content,
        user_id: userId,
        thread_id: threadId,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingMessage.id
            ? { ...msg, content: data.response }
            : msg
        )
      );
      fetchThreads();
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingMessage.id
            ? { ...msg, content: "Sorry, something went wrong. Please try again." }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border border-border rounded-2xl bg-card flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-foreground flex-1">AI Study Buddy</h2>
          <button
            onClick={startNewChat}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="New chat"
          >
            <Plus className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {/* Thread selector */}
        <div className="relative mt-1">
          <button
            onClick={() => setShowThreads(!showThreads)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="truncate max-w-[200px]">
              {threads.find((t) => t.thread_id === threadId)
                ? `Chat: ${new Date(
                    threads.find((t) => t.thread_id === threadId)!.created_at
                  ).toLocaleDateString()}`
                : "New conversation"}
            </span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {showThreads && threads.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {threads.map((thread) => (
                <button
                  key={thread.thread_id}
                  onClick={() => loadThread(thread.thread_id)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors ${
                    thread.thread_id === threadId
                      ? "bg-muted font-medium"
                      : ""
                  }`}
                >
                  {new Date(thread.created_at).toLocaleString()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                msg.role === "assistant"
                  ? "bg-primary/10 text-primary"
                  : "bg-accent-light/20 text-accent"
              }`}
            >
              {msg.role === "assistant" ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div
              className={`rounded-2xl px-3 py-2 max-w-[80%] text-sm ${
                msg.role === "assistant"
                  ? "bg-muted text-foreground"
                  : "bg-primary text-white"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1 bg-muted rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
          <CartoonButton label={loading ? "..." : "Send"} onClick={handleSend} />
        </div>
      </div>
    </div>
  );
};
