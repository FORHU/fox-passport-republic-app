"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { config } from "@/shared/lib/config";
import { CATEGORIES } from "./constants";

export function MobileSearchBar() {
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
    if (!location || location.length < 2) return;
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
              const val = e.target.value;
              setLocation(val);
              if (val.length < 2) setSuggestions([]);
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
