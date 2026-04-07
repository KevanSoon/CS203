"use client";

import { useState, useRef, useEffect } from "react";
import { CartoonButton } from "@/app/components/CartoonButton";
import { Bot, User, X, Plus, ChevronDown } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSiteState } from "@/app/store/SiteStore";


interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  isThinking?: boolean;
}

function TypingDots({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-2 h-2 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
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

// Escape | inside markdown link text to prevent table parser splitting rows
function preprocessMarkdown(content: string): string {
  return content.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_match, text, url) => {
    return `[${text.replace(/\|/g, "&#124;")}](${url})`;
  });
}

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
      content: "",
      isThinking: true,
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
            ? { ...msg, content: data.response, isThinking: false }
            : msg
        )
      );
      fetchThreads();
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingMessage.id
            ? { ...msg, content: "Sorry, something went wrong. Please try again.", isThinking: false }
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
          <h2 className="font-bold text-foreground flex-1">Simislang Study Buddy</h2>
          <button
            onClick={startNewChat}
            disabled={loading}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:pointer-events-none"
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
            disabled={loading}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:pointer-events-none"
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
              className={`rounded-2xl px-3 py-2 text-sm ${
                msg.role === "assistant"
                  ? "bg-muted text-foreground w-full"
                  : "max-w-[80%] bg-primary text-white"
              }`}
            >
              {msg.role === "assistant" ? (
                msg.isThinking ? (
                  <TypingDots />
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => (
                          <div className="overflow-x-auto max-w-full my-2">
                            <table className="min-w-full border-collapse text-xs">{children}</table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border border-border px-2 py-1.5 text-left font-semibold bg-muted whitespace-nowrap">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-border px-2 py-1.5 align-top max-w-[200px] break-words whitespace-normal">
                            {children}
                          </td>
                        ),
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {preprocessMarkdown(msg.content)}
                    </ReactMarkdown>
                  </div>
                )
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-muted-foreground px-3 py-2">
        This Chatbot uses Gen AI. Responses may be inaccurate.
      </p>

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
            className="flex-1 bg-muted rounded-full px-4 py-2 text-base text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
          <CartoonButton label={loading ? <TypingDots className="py-1" /> : "Send"} onClick={handleSend} size="sm" />
        </div>
      </div>
    </div>
  );
};
