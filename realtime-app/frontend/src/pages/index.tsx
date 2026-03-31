"use client";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

// ── SOCKET.IO connection ──
const socket = io("http://localhost:4000", {
  autoConnect: false,
});

export default function ThreadPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Real-time state
  const [username, setUsername] = useState("Anonymous");
  const [comments, setComments] = useState<any[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  // Input fields
  const [inputValue, setInputValue] = useState("");
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // High-End Notifications
  const [notifications, setNotifications] = useState<any[]>([]);

  // Smooth UI mounting and theming
  useEffect(() => {
    if (!isMounted) {
      const savedTheme = localStorage.getItem("theme");
      const savedName = localStorage.getItem("");
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialDark = savedTheme === "dark" || (!savedTheme && prefersDark);

      setDarkMode(initialDark);
      document.documentElement.setAttribute(
        "data-theme",
        initialDark ? "dark" : "light",
      );

      if (savedName) setUsername(savedName);
      setIsMounted(true);
    } else {
      document.documentElement.setAttribute(
        "data-theme",
        darkMode ? "dark" : "light",
      );
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    }
  }, [darkMode, isMounted]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setUsername(newName);
    localStorage.setItem("username", newName);
  };

  // Socket setup
  useEffect(() => {
    if (!isMounted) return;

    socket.connect();
    socket.on("connect", () => {
      socket.emit("set_username", { username: username || "Anonymous" });
    });

    socket.on("load_comments", (loadedComments: any[]) => {
      setComments(loadedComments);
    });

    socket.on("new_comment", (comment: any) => {
      setComments((prev) => {
        if (prev.find((c) => c.id === comment.id)) return prev;
        return [comment, ...prev];
      });
    });

    socket.on("comment_notification", (data: any) => {
      addNotification(
        `<strong>${data.username}</strong> has commented`,
        "comment",
      );
    });

    socket.on("online_count", (count: number) => {
      setOnlineCount(count);
    });

    return () => {
      socket.off("connect");
      socket.off("load_comments");
      socket.off("new_comment");
      socket.off("comment_notification");
      socket.off("online_count");
      socket.disconnect();
    };
  }, [isMounted]);

  const addNotification = (htmlMsg: string, type: "comment" | "success") => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [
      { id, htmlMsg, type, time: "just now" },
      ...prev,
    ]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  const submitComment = () => {
    const text = inputValue.trim();
    if (!text) {
      addNotification("Please enter a comment before posting!", "comment");
      return;
    }
    const finalName = username.trim() || "Anonymous";
    socket.emit("add_comment", { username: finalName, text });
    setInputValue("");
    addNotification("Your comment was posted successfully! 🎉", "success");
  };

  const toggleLike = (id: string) => {
    const newSet = new Set(likedComments);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setLikedComments(newSet);
  };

  if (!isMounted) return null;

  // Avatar colors — purple/orange palette
  const getAvatarColor = (name: string) => {
    const n = name || "Anonymous";
    const colors = [
      "linear-gradient(135deg, #6b21f5 0%, #9d5fff 100%)",
      "linear-gradient(135deg, #f5610d 0%, #ffb347 100%)",
      "linear-gradient(135deg, #9d5fff 0%, #ff3d9a 100%)",
      "linear-gradient(135deg, #ff7a2e 0%, #f5610d 100%)",
      "linear-gradient(135deg, #1aad6e 0%, #38f9d7 100%)",
    ];
    const val = n.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return colors[val % colors.length];
  };

  return (
    <div className="page">
      {/* ── TOPBAR ── */}
      <header className="topbar">
        <div className="topbarLeft">
          <div className="logoMark">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="logoText">LiveThread</span>
         
        </div>

        <div className="topbarRight">
          <div className="onlinePill">
            <span className="onlineDot" />
            {onlineCount} online
          </div>
          <span
            className={`liveBadge ${onlineCount > 0 ? "liveOn" : "liveOff"}`}
          >
            {onlineCount > 0 ? "● LIVE" : "○ OFFLINE"}
          </span>
          <button className="themeBtn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                </svg>
                <span>Light</span>
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        {/* Name section */}
        <div className="sideNameWrap">
          <div className="sidebarTitle">Commenting As</div>
          <div className="sideNameRow">
            <div
              style={{
                background: getAvatarColor(username || "Anonymous"),
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.9rem",
                flexShrink: 0,
              }}
            >
              {(username || "A").charAt(0).toUpperCase()}
            </div>
            <input
              type="text"
              className="sideNameInput"
              placeholder="Your name..."
              value={username}
              onChange={handleNameChange}
              maxLength={30}
            />
          </div>
        </div>

        {/* Composer */}
        <div className="sidebarHeader">
          <div className="sidebarTitle">New Comment</div>
          <div className="sideComposer">
            <div className="composerAvatarRow">
              <div
                className="composerAvatar"
                style={{ background: getAvatarColor(username || "Anonymous") }}
              >
                {(username || "A").charAt(0).toUpperCase()}
              </div>
              <span className="composerLabel">
                <strong>{username || "Anonymous"}</strong>
              </span>
            </div>
            <textarea
              ref={inputRef}
              className="composerTextarea"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Share your thoughts..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitComment();
                }
              }}
            />
            <div className="composerFooter">
              <span className="composerHint">
                <kbd>Enter</kbd> send · <kbd>⇧</kbd> newline
              </span>
              <div className="composerRight">
                <span className="composerCount">{inputValue.length}/500</span>
                <button
                  className="submitBtn"
                  onClick={submitComment}
                  disabled={!inputValue.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="sideStats">
          <div className="sidebarTitle">Thread Stats</div>
          <div className="sideStatRow">
            <span className="sideStatKey">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Comments
            </span>
            <span className="sideStatVal accent">{comments.length}</span>
          </div>
          <div className="sideStatRow">
            <span className="sideStatKey">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              Online Now
            </span>
            <span className="sideStatVal green">{onlineCount}</span>
          </div>
          <div className="sideStatRow">
            <span className="sideStatKey">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Liked
            </span>
            <span className="sideStatVal">{likedComments.size}</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN FEED ── */}
      <main className="body">
        {/* Feed header */}
        <div className="feedMeta">
          <div className="feedCount">
            Discussion Hub&nbsp;
            <span>({comments.length})</span>
          </div>
          <div className="feedUser">
            Signed in as <strong>{username || "Anonymous"}</strong>
          </div>
        </div>

        {/* Comments */}
        <div className="feed">
          {comments.map((c) => {
            const author = c.username || c.author || "Anonymous";
            const isYou = author === username;

            return (
              <div
                key={c.id}
                className={`commentCard${isYou ? " is-new" : ""}`}
                style={
                  isYou
                    ? {
                        borderColor: "var(--accent)",
                        background: "var(--accent-bg)",
                      }
                    : {}
                }
              >
                <div className="cardLeft">
                  <div
                    className="cardAvatar"
                    style={{ background: getAvatarColor(author) }}
                  >
                    {author.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="cardRight">
                  <div className="cardMeta">
                    <span className="cardAuthor">{author}</span>
                    {isYou && <span className="youBadge">YOU</span>}
                    <span className="cardTime">
                      {new Date(
                        c.timestamp || c.createdAt || Date.now(),
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      &nbsp;·&nbsp;
                      {new Date(
                        c.timestamp || c.createdAt || Date.now(),
                      ).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="cardText">{c.text}</p>

                  <div className="cardActions">
                    <button
                      className={`cardAction like${likedComments.has(c.id) ? " liked" : ""}`}
                      onClick={() => toggleLike(c.id)}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={likedComments.has(c.id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {likedComments.has(c.id) ? "Liked" : "Like"}
                    </button>
                    <button
                      className="cardAction reply"
                      onClick={() => inputRef.current?.focus()}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {comments.length === 0 && (
            <div className="empty">
              <span>💬</span>
              <strong style={{ fontSize: "1.1rem", color: "var(--text)" }}>
                No discussions yet
              </strong>
              <p>Be the first to kickstart this thread!</p>
            </div>
          )}
        </div>
      </main>

      {/* ── TOAST NOTIFICATIONS ── */}
      <div className="toastStack">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="toast"
            style={
              n.type === "success" ? { borderLeftColor: "var(--green)" } : {}
            }
          >
            <div
              className="toastAvatar"
              style={{
                background:
                  n.type === "success"
                    ? "linear-gradient(135deg, #1aad6e, #38f9d7)"
                    : "linear-gradient(135deg, var(--accent), var(--accent2))",
              }}
            >
              {n.type === "success" ? "✓" : "🔔"}
            </div>
            <div className="toastBody">
              <div
                className="toastName"
                dangerouslySetInnerHTML={{ __html: n.htmlMsg }}
              />
              <div className="toastText">{n.time}</div>
            </div>
            <button
              className="toastClose"
              onClick={() =>
                setNotifications((prev) => prev.filter((x) => x.id !== n.id))
              }
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
