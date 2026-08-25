/* eslint-disable react-hooks/set-state-in-effect, @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  fetchTrendingTemplates,
  EventTemplate,
} from "@/features/event/api/event-templates";
import { fetchFoxers, Foxer } from "@/features/user/api/foxers";
import { useLandingPage } from "@/features/landing/hooks/useLandingPage";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import UserMenuButton from "@/features/user/components/UserMenuButton";
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";
import { BrandLogo } from "@/shared/components/layout/BrandLogo";
import api from "@/shared/lib/axios";
import { config } from "@/shared/lib/config";

// ─── Constants ───────────────────────────────────────────────────────────────

const STRIPE_BG = `repeating-linear-gradient(135deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 12px)`;

const CATEGORIES = ["Wedding", "Corporate", "Birthday", "Social", "Other"];

const CATEGORY_EMOJI: Record<string, string> = {
  birthday: "🎂",
  wedding: "💍",
  corporate: "🏢",
  social: "🎉",
  other: "✨",
};

const ROLE_LABELS: Record<string, string> = {
  eventFoxer: "Event Foxer",
  venueFoxer: "Venue Foxer",
  gearFoxer: "Gear Foxer",
  serviceFoxer: "Service Foxer",
};

const FEATURE_CARDS = [
  {
    accent: "#7c3aed",
    tag: "Venues",
    tagBg: "rgba(124,58,237,0.3)",
    tagColor: "#c4b5fd",
    name: "The Grand Ballroom",
    meta: "Makati · ₱12,000/hr",
  },
  {
    accent: "#db2777",
    tag: "Events",
    tagBg: "rgba(219,39,119,0.3)",
    tagColor: "#f9a8d4",
    name: "Saturday Night Social",
    meta: "BGC · This Saturday",
  },
  {
    accent: "#ccff00",
    tag: "Gear",
    tagBg: "rgba(204,255,0,0.15)",
    tagColor: "#ccff00",
    name: "Pro Sound Package",
    meta: "QC · ₱3,500/day",
  },
];

const FEATURES = [
  {
    icon: "check_circle",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.15)",
    title: "Verified Vibes Only",
    desc: "Every foxer and venue is verified so you can book with zero stress.",
  },
  {
    icon: "bolt",
    color: "#ccff00",
    bg: "rgba(204,255,0,0.12)",
    title: "Instant Booking",
    desc: "Skip the DMs. Book your spot instantly and get tickets to your phone.",
  },
  {
    icon: "diversity_3",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.15)",
    title: "Find Your Crew",
    desc: "Connect with foxers who match your vibe for the perfect experience.",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.35)",
        marginBottom: 14,
        margin: "0 0 14px",
      }}
    >
      {children}
    </p>
  );
}

function SkeletonCard({
  width = 200,
  height = 120,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        width,
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "#111318",
      }}
    >
      <div style={{ height, background: "rgba(255,255,255,0.04)" }} />
      <div style={{ padding: "12px 14px" }}>
        <div
          style={{
            height: 12,
            borderRadius: 6,
            background: "rgba(255,255,255,0.07)",
            marginBottom: 8,
          }}
        />
        <div
          style={{
            height: 10,
            width: "60%",
            borderRadius: 6,
            background: "rgba(255,255,255,0.04)",
          }}
        />
      </div>
    </div>
  );
}

function TemplateCard({ t }: { t: EventTemplate }) {
  const city = t.templateVenues?.[0]?.venue?.city ?? t.targetCity;
  const price = t.estimatedTotal ?? t.templateVenues?.[0]?.venue?.price;
  const img = t.images?.[0]?.url;

  return (
    <div
      style={{
        flexShrink: 0,
        width: 200,
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "#111318",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          height: 120,
          background: img
            ? undefined
            : `${STRIPE_BG}, linear-gradient(135deg,rgba(124,58,237,0.15) 0%,#111318 100%)`,
          position: "relative",
        }}
      >
        {img && (
          <img
            src={img}
            alt={t.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {t.category && (
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              borderRadius: 999,
              padding: "3px 9px",
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {CATEGORY_EMOJI[t.category] ?? "✨"} {t.category}
          </span>
        )}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 4,
            lineHeight: 1.3,
          }}
        >
          {t.name}
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          {[city, price ? `₱${Number(price).toLocaleString()}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </div>
  );
}

function FoxerCard({ f }: { f: Foxer }) {
  const role = f.roleType?.[0];
  const roleLabel = role ? (ROLE_LABELS[role] ?? role) : "Foxer";
  const rating = f.avgRating ? f.avgRating.toFixed(1) : null;
  const initial = f.name.charAt(0).toUpperCase();
  const imgSrc = f.imgId
    ? `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${f.imgId}`
    : null;

  return (
    <div
      style={{
        flexShrink: 0,
        width: 130,
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "#111318",
        padding: "14px 12px",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "2px solid rgba(204,255,0,0.3)",
          overflow: "hidden",
          margin: "0 auto 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#7c3aed",
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={f.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
            {initial}
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 3,
          lineHeight: 1.2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {f.name}
      </p>
      <p
        style={{
          fontSize: 10,
          color: "#ccff00",
          fontWeight: 600,
          marginBottom: rating ? 4 : 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {roleLabel}
      </p>
      {rating && (
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          ★ {rating}
        </p>
      )}
    </div>
  );
}

// ─── Mobile Search Bar ───────────────────────────────────────────────────────

function MobileSearchBar() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const locRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!location || location.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(
        `${config.apiUrl}/locations/search?q=${encodeURIComponent(location)}`,
      )
        .then((r) => r.json())
        .then((d) => {
          if (d.status === "success") setSuggestions(d.data.locations ?? []);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [location]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locRef.current && !locRef.current.contains(e.target as Node))
        setShowSug(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = () => {
    const errs: Record<string, string> = {};
    if (!startDate) errs.startDate = "Required";
    if (!endDate) errs.endDate = "Required";
    if (!category) errs.category = "Required";
    if (!location.trim()) errs.location = "Required";
    if (startDate && endDate && new Date(endDate) < new Date(startDate))
      errs.endDate = "Invalid";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const p = new URLSearchParams({
      category: category.toLowerCase(),
      city: location,
      label: location,
      startDate,
      endDate,
    });
    router.push(`/search?${p.toString()}`);
  };

  const fieldStyle = (err?: string): React.CSSProperties => ({
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${err ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 14,
    padding: "10px 14px",
    color: "#fff",
    fontSize: 13,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  });

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 22,
        padding: 16,
        marginBottom: 28,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        Find an Event
      </p>

      {/* Dates row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div>
          <label
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 5,
            }}
          >
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setErrors((prev) => ({ ...prev, startDate: "" }));
            }}
            style={
              {
                ...fieldStyle(errors.startDate),
                colorScheme: "dark",
              } as React.CSSProperties
            }
          />
          {errors.startDate && (
            <span
              style={{
                fontSize: 9,
                color: "#ef4444",
                marginTop: 3,
                display: "block",
              }}
            >
              {errors.startDate}
            </span>
          )}
        </div>
        <div>
          <label
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 5,
            }}
          >
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setErrors((prev) => ({ ...prev, endDate: "" }));
            }}
            style={
              {
                ...fieldStyle(errors.endDate),
                colorScheme: "dark",
              } as React.CSSProperties
            }
          />
          {errors.endDate && (
            <span
              style={{
                fontSize: 9,
                color: "#ef4444",
                marginTop: 3,
                display: "block",
              }}
            >
              {errors.endDate}
            </span>
          )}
        </div>
      </div>

      {/* Location */}
      <div style={{ marginBottom: 10 }} ref={locRef}>
        <label
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 5,
          }}
        >
          Location
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setErrors((prev) => ({ ...prev, location: "" }));
              setShowSug(true);
            }}
            onFocus={() => setShowSug(true)}
            placeholder="Manila, Cebu, Baguio…"
            style={fieldStyle(errors.location)}
          />
          {showSug && suggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                background: "#11121a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
                listStyle: "none",
                margin: 0,
                padding: 6,
                zIndex: 50,
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {suggestions.map((s) => (
                <li
                  key={s}
                  onClick={() => {
                    setLocation(s);
                    setShowSug(false);
                    setErrors((prev) => ({ ...prev, location: "" }));
                  }}
                  style={{
                    padding: "8px 12px",
                    fontSize: 13,
                    color: "#fff",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(204,255,0,0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        {errors.location && (
          <span
            style={{
              fontSize: 9,
              color: "#ef4444",
              marginTop: 3,
              display: "block",
            }}
          >
            {errors.location}
          </span>
        )}
      </div>

      {/* Category chips */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 8,
          }}
        >
          Category{" "}
          {errors.category && (
            <span style={{ color: "#ef4444", marginLeft: 6 }}>
              {errors.category}
            </span>
          )}
        </label>
        <div
          className="no-scrollbar"
          style={{ display: "flex", gap: 8, overflowX: "auto" }}
        >
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setCategory(active ? "" : cat);
                  setErrors((prev) => ({ ...prev, category: "" }));
                }}
                style={{
                  flexShrink: 0,
                  padding: "7px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: active ? "#ccff00" : "rgba(255,255,255,0.07)",
                  color: active ? "#000" : "rgba(255,255,255,0.6)",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search button */}
      <button
        onClick={handleSearch}
        style={{
          width: "100%",
          background: "#ccff00",
          color: "#000",
          fontWeight: 700,
          fontSize: 14,
          borderRadius: 14,
          padding: "13px 0",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(204,255,0,0.25)",
        }}
      >
        Search Events
      </button>
    </div>
  );
}

// ─── Newsletter ──────────────────────────────────────────────────────────────

function MobileNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await api.post("/newsletter/subscribe", { email });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        margin: "36px 20px 0",
        borderRadius: 24,
        overflow: "hidden",
        position: "relative",
        background:
          "linear-gradient(135deg,#2d0080 0%,#1a0040 50%,#050608 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "28px 20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(204,255,0,0.15)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <span
          style={{
            display: "inline-block",
            background: "#fff",
            color: "#000",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderRadius: 999,
            padding: "4px 12px",
            marginBottom: 14,
          }}
        >
          Weekly Digest
        </span>
        <h3
          style={{
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            fontSize: 28,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: 10,
          }}
        >
          FOMO is real.
          <br />
          Don&apos;t let it win.
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.55)",
            marginBottom: 18,
            lineHeight: 1.5,
          }}
        >
          Fresh drops on parties, pop-ups & limited adventures — straight to
          your inbox.
        </p>
        {status === "success" ? (
          <p style={{ color: "#ccff00", fontWeight: 700, fontSize: 14 }}>
            You&apos;re on the list! 🎉
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="your@email.com"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 14,
                padding: "12px 16px",
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              style={{
                background: "#ccff00",
                color: "#000",
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 14,
                padding: "12px 0",
                border: "none",
                cursor: "pointer",
              }}
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
            {status === "error" && (
              <p
                style={{ color: "#ef4444", fontSize: 11, textAlign: "center" }}
              >
                Something went wrong. Try again.
              </p>
            )}
          </div>
        )}
        <p
          style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.3)",
            marginTop: 14,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          No spam, just vibes.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MobileHomePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { displayedCategories } = useLandingPage();
  const { data: trending = [] } = useQuery<EventTemplate[]>({
    queryKey: ["trending-mobile"],
    queryFn: () => fetchTrendingTemplates(undefined, 8),
  });
  const { data: foxers = [] } = useQuery<Foxer[]>({
    queryKey: ["foxers-mobile"],
    queryFn: () => fetchFoxers(10, 1),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div
      style={{
        background: "#050608",
        minHeight: "100svh",
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      {/* Hero gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 380,
          background:
            "linear-gradient(180deg,rgba(124,58,237,0.3) 0%,rgba(219,39,119,0.08) 60%,rgba(5,6,8,0) 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -60,
          left: "30%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(204,255,0,0.07)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "rgba(5,6,8,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <BrandLogo logoSize={32} textSize="text-lg" />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user && <NotificationBell />}
          <UserMenuButton />
        </div>
      </div>

      {/* Hero text */}
      <div
        style={{ position: "relative", zIndex: 1, padding: "40px 20px 28px" }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(204,255,0,0.1)",
            border: "1px solid rgba(204,255,0,0.25)",
            borderRadius: 999,
            padding: "4px 12px",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#ccff00",
              boxShadow: "0 0 8px #ccff00",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#ccff00",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Let&apos;s make life an event
          </span>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            fontSize: 34,
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.05,
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
          }}
        >
          Find your
          <br />
          <span
            style={{
              backgroundImage: "linear-gradient(90deg,#c084fc,#f472b6,#fb923c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            next story.
          </span>
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            margin: "0 0 28px",
            lineHeight: 1.5,
          }}
        >
          Events, venues &amp; foxers — all in one place.
        </p>

        {/* Search bar with date / category / location */}
        <MobileSearchBar />
      </div>

      {/* Feature card strip */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 0 36px" }}>
        <div style={{ padding: "0 20px", marginBottom: 14 }}>
          <SectionLabel>Explore</SectionLabel>
        </div>
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: 14,
            overflowX: "auto",
            paddingLeft: 20,
          }}
        >
          {FEATURE_CARDS.map((card, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: 190,
                height: 220,
                borderRadius: 22,
                position: "relative",
                overflow: "hidden",
                background: `${STRIPE_BG},linear-gradient(135deg,${card.accent}22 0%,#111318 100%)`,
                border: "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.85) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 24,
                  right: 24,
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: `${card.accent}33`,
                  filter: "blur(16px)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  background: card.tagBg,
                  border: `1px solid ${card.tagColor}40`,
                  borderRadius: 9999,
                  padding: "4px 10px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: card.tagColor,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {card.tag}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 14,
                  right: 14,
                }}
              >
                <p
                  style={{
                    fontFamily:
                      'var(--font-display,"Space Grotesk",sans-serif)',
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                    margin: "0 0 4px",
                    lineHeight: 1.2,
                  }}
                >
                  {card.name}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                    margin: 0,
                  }}
                >
                  {card.meta}
                </p>
              </div>
            </div>
          ))}
          <div style={{ flexShrink: 0, width: 6 }} />
        </div>
      </div>

      {/* Browse by Vibe */}
      {displayedCategories.length > 0 && (
        <div
          style={{ padding: "0 20px 36px", position: "relative", zIndex: 1 }}
        >
          <SectionLabel>Browse by Vibe</SectionLabel>
          <div
            className="no-scrollbar"
            style={{ display: "flex", gap: 10, overflowX: "auto" }}
          >
            {displayedCategories.map((cat: any) => (
              <div
                key={cat.id}
                style={{
                  flexShrink: 0,
                  borderRadius: 16,
                  overflow: "hidden",
                  width: 130,
                  height: 80,
                  position: "relative",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: `${STRIPE_BG},#111318`,
                    }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom,transparent 20%,rgba(0,0,0,0.75) 100%)",
                  }}
                />
                <p
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 10,
                    right: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {CATEGORY_EMOJI[cat.title?.toLowerCase()] ?? "✨"} {cat.title}
                </p>
              </div>
            ))}
            <div style={{ flexShrink: 0, width: 6 }} />
          </div>
        </div>
      )}

      {/* Trending Events */}
      <div style={{ padding: "0 20px 36px", position: "relative", zIndex: 1 }}>
        <SectionLabel>Trending This Week</SectionLabel>
        <div
          className="no-scrollbar"
          style={{ display: "flex", gap: 14, overflowX: "auto" }}
        >
          {trending.length === 0
            ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
            : trending.map((t) => <TemplateCard key={t.id} t={t} />)}
          <div style={{ flexShrink: 0, width: 6 }} />
        </div>
      </div>

      {/* Who's vibe matches yours? */}
      <div style={{ padding: "0 20px 36px", position: "relative", zIndex: 1 }}>
        <SectionLabel>Who&apos;s Vibe Matches Yours?</SectionLabel>
        <div
          className="no-scrollbar"
          style={{ display: "flex", gap: 12, overflowX: "auto" }}
        >
          {foxers.length === 0
            ? [0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    flexShrink: 0,
                    width: 130,
                    borderRadius: 20,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "#111318",
                    padding: "14px 12px",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.06)",
                      margin: "0 auto 10px",
                    }}
                  />
                  <div
                    style={{
                      height: 10,
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.06)",
                      marginBottom: 6,
                    }}
                  />
                  <div
                    style={{
                      height: 9,
                      width: "60%",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.04)",
                      margin: "0 auto",
                    }}
                  />
                </div>
              ))
            : foxers.map((f) => <FoxerCard key={f.id} f={f} />)}
          <div style={{ flexShrink: 0, width: 6 }} />
        </div>
      </div>

      {/* Why FoxPassport? */}
      <div style={{ padding: "0 20px 36px", position: "relative", zIndex: 1 }}>
        <SectionLabel>Why FoxPassport?</SectionLabel>
        <div
          className="no-scrollbar"
          style={{ display: "flex", gap: 12, overflowX: "auto" }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: 180,
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.07)",
                background: "#111318",
                padding: "18px 16px",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  background: f.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 22, color: f.color }}
                >
                  {f.icon}
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 8,
                  lineHeight: 1.3,
                }}
              >
                {f.title}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
          <div style={{ flexShrink: 0, width: 6 }} />
        </div>
      </div>

      {/* Newsletter */}
      <MobileNewsletter />

      {/* Mobile Floating Bottom Navigation */}
      <MobileBottomNav
        onLoginClick={() => useAuthStore.getState().openLogin()}
        onCreateClick={() => router.push("/creator-dashboard")}
      />

      <div style={{ height: 112 }} />
    </div>
  );
}
