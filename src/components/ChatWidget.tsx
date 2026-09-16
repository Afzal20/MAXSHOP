"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  MessageCircle,
  Send,
  X,
  Moon,
  Sun,
  ShoppingCart,
  ArrowRight,
  Filter,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const HIDDEN_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];

type ChatRole = "user" | "assistant" | "error";

export interface ChatAction {
  type: "THEME" | "ADD_TO_CART" | "FILTER" | "NAVIGATE";
  payload: string;
  status: "idle" | "success" | "error";
  description: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  actions?: ChatAction[];
}

type SocketFrame =
  | { type: "connected"; model?: string; greeting?: string }
  | { type: "start"; model?: string }
  | { type: "token"; text: string }
  | { type: "done" }
  | { type: "error"; message?: string };

type ConnState = "idle" | "connecting" | "open" | "unauthenticated" | "error";

function toWebSocketUrl(apiUrl: string): string {
  const wsUrl = apiUrl.replace(/^http/, "ws").replace(/\/+$/, "");
  return `${wsUrl}/ws/ai/chat/`;
}

const ACTION_REGEX = /\[\[ACTION:([A-Z_]+):([^\]]+)\]\]/g;
const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

function parseActions(text: string): { cleanText: string; rawActions: Array<{ type: string; payload: string }> } {
  const rawActions: Array<{ type: string; payload: string }> = [];
  const cleanText = text
    .replace(ACTION_REGEX, (_, type, payload) => {
      rawActions.push({ type: type.trim(), payload: payload.trim() });
      return "";
    })
    .replace(EMOJI_REGEX, "")
    .trim();

  // Robust fallback: if model text clearly says it is heading to checkout but forgot the tag
  if (
    !rawActions.some((a) => a.type === "NAVIGATE") &&
    /(?:heading to checkout|take you to checkout|taking you to checkout|navigate to checkout|navigating to checkout|go to checkout)/i.test(
      cleanText
    )
  ) {
    rawActions.push({ type: "NAVIGATE", payload: "/checkout" });
  }

  return { cleanText, rawActions };
}

export function ChatWidget() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [connState, setConnState] = useState<ConnState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const streamingTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const executedActionsRef = useRef<Set<string>>(new Set());
  const isConnectingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const getCurrentProductContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    const match = pathname.match(/^\/products\/(\d+)/);
    if (!match) return null;
    const productId = parseInt(match[1], 10);

    const container = document.querySelector("[data-product-id]");
    const title =
      container?.getAttribute("data-product-title") ||
      document.querySelector("h1")?.textContent?.trim() ||
      "";
    const price =
      container?.getAttribute("data-product-price") ||
      document.querySelector("[data-product-price]")?.getAttribute("data-product-price") ||
      "";

    return {
      id: productId,
      title,
      price,
    };
  }, [pathname]);

  const executeAction = useCallback(
    async (action: { type: string; payload: string }): Promise<ChatAction> => {
      const actionType = action.type.toUpperCase();

      if (actionType === "THEME") {
        const theme = action.payload.toLowerCase();
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
          return {
            type: "THEME",
            payload: "dark",
            status: "success",
            description: "Dark theme activated",
          };
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("theme", "light");
          return {
            type: "THEME",
            payload: "light",
            status: "success",
            description: "Light theme activated",
          };
        }
      }

      if (actionType === "ADD_TO_CART") {
        let itemId: number | null = null;
        if (action.payload === "current") {
          const currentProd = getCurrentProductContext();
          if (currentProd) itemId = currentProd.id;
        } else {
          const parsed = parseInt(action.payload, 10);
          if (!isNaN(parsed)) itemId = parsed;
        }

        if (!itemId) {
          return {
            type: "ADD_TO_CART",
            payload: action.payload,
            status: "error",
            description: "Could not identify product to add to cart",
          };
        }

        try {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              item: itemId,
              quantity: 1,
              item_color_code: "N/A",
              item_size: "N/A",
            }),
          });

          if (res.ok) {
            router.refresh();
            return {
              type: "ADD_TO_CART",
              payload: String(itemId),
              status: "success",
              description: `Product #${itemId} added to cart`,
            };
          } else {
            const errData = await res.json().catch(() => ({})) as Record<string, string>;
            return {
              type: "ADD_TO_CART",
              payload: String(itemId),
              status: "error",
              description: errData.detail || errData.error || "Failed to add to cart",
            };
          }
        } catch {
          return {
            type: "ADD_TO_CART",
            payload: String(itemId),
            status: "error",
            description: "Network error adding product to cart",
          };
        }
      }

      if (actionType === "FILTER") {
        const rawPayload = action.payload;
        let targetUrl = "/products";
        if (rawPayload.includes("=")) {
          const [key, ...vals] = rawPayload.split("=");
          const val = vals.join("=");
          targetUrl = `/products?${encodeURIComponent(key.trim())}=${encodeURIComponent(val.trim())}`;
        } else {
          targetUrl = `/products?category=${encodeURIComponent(rawPayload.trim())}`;
        }
        router.push(targetUrl);
        return {
          type: "FILTER",
          payload: rawPayload,
          status: "success",
          description: `Navigating to filtered products: ${rawPayload}`,
        };
      }

      if (actionType === "NAVIGATE") {
        const targetPath = action.payload.startsWith("/") ? action.payload : `/${action.payload}`;
        router.push(targetPath);
        if (typeof window !== "undefined") {
          setTimeout(() => {
            if (window.location.pathname !== targetPath.split("?")[0]) {
              window.location.href = targetPath;
            }
          }, 300);
        }
        return {
          type: "NAVIGATE",
          payload: targetPath,
          status: "success",
          description: `Navigating to ${targetPath}`,
        };
      }

      return {
        type: "NAVIGATE",
        payload: action.payload,
        status: "error",
        description: `Unsupported action: ${actionType}`,
      };
    },
    [getCurrentProductContext, router]
  );

  const connect = useCallback(async () => {
    if (isConnectingRef.current) return;
    if (socketRef.current && socketRef.current.readyState <= WebSocket.OPEN) return;

    isConnectingRef.current = true;
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

      ws.onmessage = async (event) => {
        let frame: SocketFrame;
        try {
          frame = JSON.parse(event.data) as SocketFrame;
        } catch {
          return;
        }

        if (frame.type === "connected") {
          if (frame.greeting) {
            const { cleanText, rawActions } = parseActions(frame.greeting);
            const initialActions: ChatAction[] = [];
            for (const act of rawActions) {
              const resAct = await executeAction(act);
              initialActions.push(resAct);
            }

            setMessages((prev) => [
              ...prev,
              {
                id: `msg-${Date.now()}-${Math.random()}`,
                role: "assistant",
                content: cleanText || frame.greeting!,
                actions: initialActions.length > 0 ? initialActions : undefined,
              },
            ]);
            historyRef.current.push({ role: "assistant", content: cleanText || frame.greeting! });
            scrollToBottom();
          }
        } else if (frame.type === "start") {
          setIsStreaming(true);
          streamingTextRef.current = "";
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-stream-${Date.now()}`,
              role: "assistant",
              content: "",
            },
          ]);
        } else if (frame.type === "token") {
          streamingTextRef.current += frame.text;
          const { cleanText } = parseActions(streamingTextRef.current);
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === "assistant") {
              next[next.length - 1] = {
                ...last,
                content: cleanText,
              };
            }
            return next;
          });
          scrollToBottom();
        } else if (frame.type === "done") {
          setIsStreaming(false);
          const { cleanText, rawActions } = parseActions(streamingTextRef.current);
          const resolvedActions: ChatAction[] = [];

          for (const act of rawActions) {
            const key = `${act.type}:${act.payload}`;
            if (!executedActionsRef.current.has(key)) {
              executedActionsRef.current.add(key);
              const executed = await executeAction(act);
              resolvedActions.push(executed);
            }
          }

          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === "assistant") {
              next[next.length - 1] = {
                ...last,
                content: cleanText || streamingTextRef.current,
                actions: resolvedActions.length > 0 ? resolvedActions : last.actions,
              };
            }
            return next;
          });

          historyRef.current.push({
            role: "assistant",
            content: cleanText || streamingTextRef.current,
          });
          scrollToBottom();
        } else if (frame.type === "error") {
          setIsStreaming(false);
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-err-${Date.now()}`,
              role: "error",
              content: frame.message || "The assistant is unavailable.",
            },
          ]);
          scrollToBottom();
        }
      };

      ws.onclose = (event) => {
        setIsStreaming(false);
        if (event.code === 4401) {
          setConnState("unauthenticated");
        } else {
          setConnState((state) => (state === "unauthenticated" ? state : "error"));
        }
      };

      ws.onerror = () => {
        setIsStreaming(false);
      };
    } catch {
      setConnState("error");
    } finally {
      isConnectingRef.current = false;
    }
  }, [executeAction, scrollToBottom]);

  const openPanel = useCallback(() => {
    setIsOpen(true);
    if (connState !== "open" && connState !== "connecting") {
      void connect();
    }
  }, [connState, connect]);

  const sendQuery = useCallback(
    async (queryText: string) => {
      const text = queryText.trim();
      const ws = socketRef.current;
      if (!text || isStreaming || !ws || ws.readyState !== WebSocket.OPEN) return;

      executedActionsRef.current.clear();

      const lowerText = text.toLowerCase();
      const localActions: ChatAction[] = [];

      // Client intent acceleration for instant response
      if (lowerText.includes("dark mode") || lowerText.includes("dark theme") || lowerText === "dark") {
        const res = await executeAction({ type: "THEME", payload: "dark" });
        localActions.push(res);
      } else if (
        lowerText.includes("light mode") ||
        lowerText.includes("light theme") ||
        lowerText === "light"
      ) {
        const res = await executeAction({ type: "THEME", payload: "light" });
        localActions.push(res);
      } else if (
        lowerText.includes("checkout") ||
        lowerText.includes("check out") ||
        lowerText.includes("place order") ||
        lowerText.includes("buy now")
      ) {
        let target = "/checkout";
        const queryParams = new URLSearchParams();
        const nameMatch = text.match(/name\s*(?:is|:|=)?\s*([a-zA-Z]+)/i);
        if (nameMatch) queryParams.set("first_name", nameMatch[1]);
        const cityMatch = text.match(/(?:from|in|city)\s*([a-zA-Z]+)/i);
        if (cityMatch) queryParams.set("city", cityMatch[1]);
        if (queryParams.toString()) {
          target = `/checkout?${queryParams.toString()}`;
        }
        const res = await executeAction({ type: "NAVIGATE", payload: target });
        localActions.push(res);
      } else if (
        (lowerText.includes("add to cart") || lowerText.includes("add current product")) &&
        getCurrentProductContext()
      ) {
        const res = await executeAction({ type: "ADD_TO_CART", payload: "current" });
        localActions.push(res);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-user-${Date.now()}`,
          role: "user",
          content: text,
          actions: localActions.length > 0 ? localActions : undefined,
        },
      ]);
      historyRef.current.push({ role: "user", content: text });
      setInput("");
      scrollToBottom();

      const currentProd = getCurrentProductContext();
      const contextPayload: Record<string, unknown> = {
        current_page: pathname,
      };
      if (currentProd) {
        contextPayload.current_product = currentProd;
      }

      ws.send(
        JSON.stringify({
          type: "chat",
          message: text,
          history: historyRef.current.slice(0, -1).slice(-10),
          context: contextPayload,
        })
      );
    },
    [executeAction, getCurrentProductContext, isStreaming, pathname, scrollToBottom]
  );

  const sendMessage = useCallback(() => {
    void sendQuery(input);
  }, [input, sendQuery]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  // Close socket when navigating to hidden routes (auth pages)
  useEffect(() => {
    if (HIDDEN_ROUTES.includes(pathname)) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    }
  }, [pathname]);

  if (HIDDEN_ROUTES.includes(pathname)) return null;

  const currentProduct = getCurrentProductContext();

  const suggestionChips = currentProduct
    ? [
        { label: "Add to cart", query: "Add current product to cart" },
        { label: "Price & deals", query: "Tell me about the price and discounts for this item" },
        { label: "Dark theme", query: "Change theme to dark" },
        { label: "Go to checkout", query: "Go to checkout" },
      ]
    : [
        { label: "Dark theme", query: "Change theme to dark" },
        { label: "Light theme", query: "Change theme to light" },
        { label: "Filter: Laptops", query: "Filter products to laptops" },
        { label: "Best deals", query: "What are the best product deals available?" },
        { label: "Go to checkout", query: "Go to checkout" },
      ];

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {isOpen && (
        <div className="mb-3 w-[380px] h-[550px] max-h-[82vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#e5e5e5] overflow-hidden">
          {/* Header */}
          <div className="bg-[#e34444] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight flex items-center gap-1.5">
                  ShopMate <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                </p>
                <p className="text-[11px] opacity-90 leading-tight">
                  {currentProduct ? `Viewing: ${currentProduct.title.slice(0, 22)}...` : "AI Shopping Assistant"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const isDark = document.documentElement.classList.contains("dark");
                  void executeAction({ type: "THEME", payload: isDark ? "light" : "dark" });
                }}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                title="Toggle Theme"
                aria-label="Toggle Theme"
              >
                <Moon className="w-4 h-4 hidden dark:block" />
                <Sun className="w-4 h-4 block dark:hidden" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#fafafa]"
          >
            {connState === "connecting" && (
              <p className="text-xs text-gray-500 text-center py-6">Connecting...</p>
            )}
            {connState === "unauthenticated" && (
              <div className="text-center py-8 px-4">
                <p className="text-sm text-gray-600 mb-3">
                  Sign in to chat with the shopping assistant.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="inline-block bg-[#e34444] text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-[#cc3a3a] transition-colors"
                  >
                    Sign in
                  </Link>
                  <button
                    onClick={() => void connect()}
                    className="inline-block bg-gray-100 hover:bg-gray-200 text-[#333333] text-sm font-bold px-4 py-2 rounded-full transition-colors"
                  >
                    Retry
                  </button>
                </div>
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

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} space-y-1.5`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#e34444] text-white rounded-br-sm shadow-sm"
                      : msg.role === "error"
                        ? "bg-[#fdecea] text-[#c0392b] border border-[#f5c6cb]"
                        : "bg-white text-[#333333] border border-[#e5e5e5] rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.content ||
                    (isStreaming && msg === messages[messages.length - 1] ? (
                      <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse" />
                    ) : null)}
                </div>

                {/* Interactive Action Badges/Cards */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="max-w-[85%] flex flex-col gap-1.5">
                    {msg.actions.map((action, aIdx) => (
                      <div
                        key={aIdx}
                        className="bg-white border border-[#e5e5e5] rounded-xl p-2.5 shadow-sm text-xs flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-[#333333]">
                          {action.type === "THEME" && (
                            <>
                              {action.payload === "dark" ? (
                                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                              ) : (
                                <Sun className="w-3.5 h-3.5 text-amber-500" />
                              )}
                              <span>{action.description}</span>
                            </>
                          )}
                          {action.type === "ADD_TO_CART" && (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                              <span>{action.description}</span>
                            </>
                          )}
                          {action.type === "FILTER" && (
                            <>
                              <Filter className="w-3.5 h-3.5 text-blue-600" />
                              <span>{action.description}</span>
                            </>
                          )}
                          {action.type === "NAVIGATE" && (
                            <>
                              <ArrowRight className="w-3.5 h-3.5 text-[#e34444]" />
                              <span>{action.description}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          {action.type === "ADD_TO_CART" && (
                            <>
                              <Link
                                href="/cart"
                                className="bg-gray-100 hover:bg-gray-200 text-[#333333] px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1"
                              >
                                <ShoppingCart className="w-3 h-3" /> View Cart
                              </Link>
                              <Link
                                href="/checkout"
                                className="bg-[#e34444] hover:bg-[#cc3a3a] text-white px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1"
                              >
                                Checkout <ArrowRight className="w-3 h-3" />
                              </Link>
                            </>
                          )}
                          {action.type === "FILTER" && (
                            <Link
                              href="/products"
                              className="text-[#e34444] hover:underline font-medium flex items-center gap-1"
                            >
                              Explore Products <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                          {action.type === "NAVIGATE" && (
                            <Link
                              href={action.payload}
                              className="text-[#e34444] hover:underline font-medium flex items-center gap-1"
                            >
                              Open Page <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                          {action.type === "THEME" && (
                            <button
                              onClick={() => {
                                const nextTheme = action.payload === "dark" ? "light" : "dark";
                                void executeAction({ type: "THEME", payload: nextTheme });
                              }}
                              className="text-[#e34444] hover:underline font-medium"
                            >
                              Switch to {action.payload === "dark" ? "Light" : "Dark"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {connState === "open" && messages.length === 0 && (
              <div className="text-center py-8 px-4 text-gray-400">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">How can I assist your shopping today?</p>
              </div>
            )}
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-1.5 bg-[#f5f5f5] border-t border-[#e5e5e5] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => void sendQuery(chip.query)}
                disabled={connState !== "open" || isStreaming}
                className="text-[11px] whitespace-nowrap bg-white border border-[#e5e5e5] px-2.5 py-1 rounded-full text-[#555555] hover:text-[#e34444] hover:border-[#e34444] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
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
                connState === "open"
                  ? currentProduct
                    ? "Ask about this product, price, cart, theme..."
                    : "Ask about products, prices, theme, checkout..."
                  : "Connecting to ShopMate..."
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

      {/* Floating Toggle Button */}
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
