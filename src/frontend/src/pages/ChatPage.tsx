import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";

interface ChatMessage {
  username: string;
  message: string;
  timestamp: bigint;
}

function formatTime(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatPage() {
  const { actor, isFetching } = useActor();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [username, setUsername] = useState(
    () => localStorage.getItem("chat_username") || "",
  );
  const [usernameInput, setUsernameInput] = useState(username);
  const [isUsernameSet, setIsUsernameSet] = useState(!!username);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!actor) return;
    try {
      const msgs = await actor.getRecentMessages(BigInt(50));
      setMessages(
        [...msgs].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1)),
      );
    } catch (e) {
      console.error("Failed to fetch messages", e);
    }
  }, [actor]);

  useEffect(() => {
    if (!actor || isFetching) return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [actor, isFetching, fetchMessages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSetUsername = () => {
    const trimmed = usernameInput.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    localStorage.setItem("chat_username", trimmed);
    setIsUsernameSet(true);
  };

  const handleSend = async () => {
    const msg = inputMsg.trim();
    if (!msg || !username || !actor || sending) return;
    setSending(true);
    try {
      await actor.sendMessage(username, msg);
      setInputMsg("");
      await fetchMessages();
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isUsernameSet) {
    return (
      <main
        className="flex items-center justify-center"
        style={{
          minHeight: "calc(100vh - 72px)",
          marginTop: "72px",
          background: "oklch(0.07 0.02 258)",
        }}
      >
        <div
          className="w-full max-w-sm p-8 rounded-2xl border"
          style={{
            background: "oklch(0.11 0.028 258)",
            borderColor: "oklch(0.65 0.28 25 / 0.4)",
            boxShadow: "0 0 40px oklch(0.65 0.28 25 / 0.15)",
          }}
          data-ocid="chat.modal"
        >
          <div className="flex flex-col items-center gap-2 mb-7">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
              style={{
                background: "oklch(0.65 0.28 25 / 0.15)",
                border: "2px solid oklch(0.65 0.28 25 / 0.5)",
              }}
            >
              <User
                className="w-7 h-7"
                style={{ color: "oklch(0.65 0.28 25)" }}
              />
            </div>
            <h1
              className="font-orbitron text-xl font-bold tracking-widest uppercase"
              style={{
                color: "oklch(0.65 0.28 25)",
                textShadow: "0 0 15px oklch(0.65 0.28 25 / 0.6)",
              }}
            >
              Chat Room
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              Choose a username to enter the chat
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetUsername()}
              placeholder="Enter your username..."
              maxLength={24}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "oklch(0.15 0.03 258)",
                border: "1px solid oklch(0.35 0.08 258)",
                color: "oklch(0.97 0 0)",
              }}
              data-ocid="chat.input"
            />
            <button
              type="button"
              onClick={handleSetUsername}
              className="w-full py-3 rounded-xl font-orbitron text-sm font-bold tracking-wider uppercase transition-all"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.28 25), oklch(0.55 0.28 15))",
                color: "#fff",
                boxShadow: "0 0 20px oklch(0.65 0.28 25 / 0.4)",
              }}
              data-ocid="chat.submit_button"
            >
              Enter Chat
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        height: "calc(100vh - 72px)",
        marginTop: "72px",
        background: "oklch(0.07 0.02 258)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header bar */}
      <div
        className="flex-shrink-0 px-5 py-3 border-b flex items-center gap-3"
        style={{
          background: "oklch(0.10 0.025 258)",
          borderColor: "oklch(0.65 0.28 25 / 0.2)",
        }}
      >
        <MessageSquare
          className="w-5 h-5"
          style={{ color: "oklch(0.65 0.28 25)" }}
        />
        <span
          className="font-orbitron font-bold tracking-widest text-sm uppercase"
          style={{
            color: "oklch(0.65 0.28 25)",
            textShadow: "0 0 10px oklch(0.65 0.28 25 / 0.5)",
          }}
        >
          Live Chat Room
        </span>
        <span
          className="ml-auto text-xs px-3 py-1 rounded-full"
          style={{
            background: "oklch(0.65 0.28 25 / 0.15)",
            color: "oklch(0.65 0.28 25)",
            border: "1px solid oklch(0.65 0.28 25 / 0.3)",
          }}
        >
          {messages.length} messages
        </span>
        <button
          type="button"
          onClick={() => {
            setIsUsernameSet(false);
            setUsernameInput(username);
          }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
          title="Change username"
          data-ocid="chat.edit_button"
        >
          <User className="w-4 h-4 inline mr-1" />
          {username}
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3" data-ocid="chat.panel">
        {messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
            data-ocid="chat.empty_state"
          >
            <MessageSquare
              className="w-12 h-12 opacity-20"
              style={{ color: "oklch(0.65 0.28 25)" }}
            />
            <p className="text-muted-foreground text-sm">
              No messages yet. Say something!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-2">
            {messages.map((msg, i) => {
              const isMe = msg.username === username;
              return (
                <div
                  key={`${msg.username}-${msg.timestamp}-${i}`}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  data-ocid={`chat.item.${i + 1}`}
                >
                  <div
                    className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl"
                    style={
                      isMe
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.55 0.28 25), oklch(0.45 0.25 15))",
                            borderBottomRightRadius: "4px",
                            boxShadow: "0 0 15px oklch(0.65 0.28 25 / 0.25)",
                          }
                        : {
                            background: "oklch(0.14 0.03 258)",
                            border: "1px solid oklch(0.28 0.05 258)",
                            borderBottomLeftRadius: "4px",
                          }
                    }
                  >
                    {!isMe && (
                      <p
                        className="text-xs font-bold mb-1 tracking-wide"
                        style={{ color: "oklch(0.75 0.2 320)" }}
                      >
                        {msg.username}
                      </p>
                    )}
                    <p
                      className="text-sm leading-relaxed break-words"
                      style={{ color: "oklch(0.97 0 0)" }}
                    >
                      {msg.message}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input bar */}
      <div
        className="flex-shrink-0 px-4 py-3 border-t flex items-center gap-3"
        style={{
          background: "oklch(0.10 0.025 258)",
          borderColor: "oklch(0.65 0.28 25 / 0.2)",
        }}
      >
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={500}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: "oklch(0.15 0.03 258)",
            border: "1px solid oklch(0.35 0.08 258)",
            color: "oklch(0.97 0 0)",
          }}
          data-ocid="chat.input"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !inputMsg.trim()}
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.28 25), oklch(0.55 0.28 15))",
            boxShadow:
              sending || !inputMsg.trim()
                ? "none"
                : "0 0 15px oklch(0.65 0.28 25 / 0.5)",
          }}
          data-ocid="chat.submit_button"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </main>
  );
}
