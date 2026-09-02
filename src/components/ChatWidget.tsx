"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bot, MessageCircle, Send, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const HIDDEN_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];

type ChatRole = "user" | "assistant" | "error";
interface ChatMessage {
  role: ChatRole;
  content: string;
}

type SocketFrame =
  | { type: "connected"; model?: string; greeting?: string }
  | { type: "start"; model?: string }
  | { type: "token"; text: string }
  | { type: "done" }
  | { type: "error"; message?: string };

type ConnState = "idle" | "connecting" | "open" | "unauthenticated" | "error";

function toWebSocketUrl(apiUrl: string): string {
  return apiUrl.replace(/^http/, "ws") + "/ws/ai/chat/";
}

export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [connState, setConnState] = useState<ConnState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const streamingTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const connect = useCallback(async () => {
    if (socketRef.current && socketRef.current.readyState <= WebSocket.OPEN) return;

    setConnState("connecting");
    try {
      const res = await fetch("/api/ai/ws-token");
      if (res.status === 401) {
        setConnState("unauthenticated");
        return;
      }
      if (!res.ok) throw new Error("token fetch failed");
      const { token } = (await res.json()) as { token: string };

      const ws = new WebSocket(
        `${toWebSocketUrl(API_URL)}?token=${encodeURIComponent(token)}`
      );
      socketRef.current = ws;

      ws.onopen = () => setConnState("open");

      ws.onmessage = (event) => {
        let frame: SocketFrame;
        try {
          frame = JSON.parse(event.data) as SocketFrame;
        } catch {
          return;
        }

        if (frame.type === "connected") {
          if (frame.greeting) {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: frame.greeting! },
            ]);
            historyRef.current.push({ role: "assistant", content: frame.greeting! });
            scrollToBottom();
          }
        } else if (frame.type === "start") {
          setIsStreaming(true);
          streamingTextRef.current = "";
          setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        } else if (frame.type === "token") {
          streamingTextRef.current += frame.text;
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === "assistant") {
              next[next.length - 1] = { ...last, content: streamingTextRef.current };
            }
            return next;
          });
          scrollToBottom();
        } else if (frame.type === "done") {
          setIsStreaming(false);
          historyRef.current.push({
            role: "assistant",
            content: streamingTextRef.current,
          });
          scrollToBottom();
        } else if (frame.type === "error") {
          setIsStreaming(false);
          setMessages((prev) => [
            ...prev,
            { role: "error", content: frame.message || "The assistant is unavailable." },
          ]);
          scrollToBottom();
        }
      };

      ws.onclose = () => {
        setIsStreaming(false);
        setConnState((state) => (state === "unauthenticated" ? state : "error"));
      };

      ws.onerror = () => {
        setIsStreaming(false);
      };
    } catch {
      setConnState("error");
    }
  }, [scrollToBottom]);

  const openPanel = useCallback(() => {
    setIsOpen(true);
    if (connState === "idle" || connState === "error") {
      void connect();
    }
  }, [connState, connect]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    const ws = socketRef.current;
    if (!text || isStreaming || !ws || ws.readyState !== WebSocket.OPEN) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    historyRef.current.push({ role: "user", content: text });
    setInput("");
    scrollToBottom();

    // The backend appends the current message itself; send only prior turns.
    ws.send(
      JSON.stringify({
        type: "chat",
        message: text,
        history: historyRef.current.slice(0, -1).slice(-10),
      })
    );
  }, [input, isStreaming, scrollToBottom]);

  // Reset the widget on auth pages and clean up the socket on unmount.
  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  if (HIDDEN_ROUTES.includes(pathname)) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {isOpen && (
        <div className="mb-3 w-[360px] h-[520px] max-h-[75vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#e5e5e5] overflow-hidden">
          {/* Header */}
          <div className="bg-[#e34444] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">ShopMate</p>
                <p className="text-[11px] opacity-80 leading-tight">
                  AI shopping assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#fafafa]"
          >
            {connState === "connecting" && (
              <p className="text-xs text-gray-500 text-center py-6">Connecting…</p>
            )}
            {connState === "unauthenticated" && (
              <div className="text-center py-8 px-4">
                <p className="text-sm text-gray-600 mb-3">
                  Sign in to chat with the shopping assistant.
                </p>
                <Link
                  href="/login"
                  className="inline-block bg-[#e34444] text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-[#cc3a3a] transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}
            {connState === "error" && (
              <div className="text-center py-6 px-4">
                <p className="text-sm text-gray-600 mb-3">
                  The assistant is unreachable right now.
                </p>
                <button
                  onClick={() => void connect()}
                  className="inline-block bg-[#e34444] text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-[#cc3a3a] transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#e34444] text-white rounded-br-sm"
                      : msg.role === "error"
                        ? "bg-[#fdecea] text-[#c0392b] border border-[#f5c6cb]"
                        : "bg-white text-[#333333] border border-[#e5e5e5] rounded-bl-sm"
                  }`}
                >
                  {msg.content ||
                    (isStreaming && idx === messages.length - 1 ? (
                      <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse" />
                    ) : null)}
                </div>
              </div>
            ))}

            {connState === "open" && messages.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">
                Starting assistant…
              </p>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[#e5e5e5] bg-white px-3 py-2.5 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                connState === "open" ? "Ask about products…" : "Waiting for connection…"
              }
              disabled={connState !== "open" || isStreaming}
              className="flex-1 h-10 px-4 text-sm border-2 border-[#e5e5e5] rounded-full outline-none focus:border-[#e34444] transition-colors disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button
              onClick={sendMessage}
              disabled={connState !== "open" || isStreaming || !input.trim()}
              className="bg-[#e34444] text-white p-2.5 rounded-full hover:bg-[#cc3a3a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : openPanel())}
        className="ml-auto flex items-center justify-center w-14 h-14 bg-[#e34444] text-white rounded-full shadow-lg hover:bg-[#cc3a3a] hover:scale-105 transition-all"
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
