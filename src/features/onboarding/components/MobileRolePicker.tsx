"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/shared/lib/axios";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type RoleId =
  "citizen" | "venueFoxer" | "eventFoxer" | "gearFoxer" | "serviceFoxer";

interface Role {
  id: RoleId;
  label: string;
  desc: string;
  icon: string;
  color: string;
  iconBg: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ROLES: Role[] = [
  {
    id: "citizen",
    label: "Citizen",
    desc: "Discover & book events",
    icon: "explore",
    color: "#ccff00",
    iconBg: "rgba(204,255,0,0.2)",
  },
  {
    id: "venueFoxer",
    label: "Venue Foxer",
    desc: "List your space",
    icon: "apartment",
    color: "#ec4899",
    iconBg: "rgba(236,72,153,0.2)",
  },
  {
    id: "eventFoxer",
    label: "Event Foxer",
    desc: "Curate experiences",
    icon: "auto_awesome",
    color: "#a78bfa",
    iconBg: "rgba(167,139,250,0.2)",
  },
  {
    id: "gearFoxer",
    label: "Gear Foxer",
    desc: "Rent out equipment",
    icon: "inventory_2",
    color: "#38bdf8",
    iconBg: "rgba(56,189,248,0.2)",
  },
  {
    id: "serviceFoxer",
    label: "Service Foxer",
    desc: "Offer catering, photography & more",
    icon: "design_services",
    color: "#34d399",
    iconBg: "rgba(52,211,153,0.2)",
  },
];

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "20px 20px 0" }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            background: i < current ? "#ccff00" : "rgba(255,255,255,0.12)",
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}

// ─── Role Card ────────────────────────────────────────────────────────────────

function RoleCard({
  role,
  selected,
  onToggle,
}: {
  role: Role;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        textAlign: "left",
        padding: 16,
        boxSizing: "border-box",
        borderRadius: 18,
        border: selected
          ? `1.5px solid ${role.color}`
          : "1.5px solid rgba(255,255,255,0.1)",
        background: selected ? `${role.color}0d` : "rgba(255,255,255,0.03)",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {/* Icon box */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          flexShrink: 0,
          background: selected ? role.iconBg : "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 22,
            color: selected ? role.color : "rgba(255,255,255,0.4)",
          }}
        >
          {role.icon}
        </span>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {role.label}
        </p>
        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            margin: "2px 0 0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {role.desc}
        </p>
      </div>

      {/* Toggle circle */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          flexShrink: 0,
          background: selected ? role.color : "transparent",
          border: selected ? "none" : "1.5px solid rgba(255,255,255,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        {selected && (
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 14,
              color: "#000",
              fontVariationSettings: "'wght' 700",
            }}
          >
            check
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MobileRolePicker({
  step = 2,
  totalSteps = 4,
  onBack,
  onContinue,
}: {
  step?: number;
  totalSteps?: number;
  onBack?: () => void;
  onContinue?: (selected: RoleId[]) => void;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<RoleId>>(new Set(["citizen"]));
  const [saving, setSaving] = useState(false);

  const toggle = (id: RoleId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = async () => {
    if (selected.size === 0) {
      toast.error("Please select at least one role.");
      return;
    }

    if (onContinue) {
      onContinue(Array.from(selected));
      return;
    }

    // Default: save role preferences to the profile API then go to next step
    setSaving(true);
    try {
      await api.put("/profile", { intendedRoles: Array.from(selected) });
    } catch {
      // Non-blocking
    } finally {
      setSaving(false);
    }
    router.push("/");
  };

  return (
    <div
      style={{
        background: "#050608",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
      }}
    >
      {/* Progress bar */}
      <ProgressBar current={step} total={totalSteps} />

      {/* Nav bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 16px 0",
          gap: 10,
        }}
      >
        <button
          onClick={onBack ?? (() => router.back())}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, color: "rgba(255,255,255,0.7)" }}
          >
            arrow_back
          </span>
        </button>
        <p
          style={{
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            margin: 0,
            flex: 1,
          }}
        >
          Get Started
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 0" }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#ccff00",
            marginBottom: 10,
          }}
        >
          Step {step} of {totalSteps}
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 8,
            color: "#fff",
          }}
        >
          What brings
          <br />
          you here?
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          Pick every role that fits — you can add more later.
        </p>

        {/* Role cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            paddingBottom: 140,
          }}
        >
          {ROLES.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              selected={selected.has(role.id)}
              onToggle={() => toggle(role.id)}
            />
          ))}
        </div>
      </div>

      {/* Sticky Continue button */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px 36px",
          background:
            "linear-gradient(to top, #050608 70%, rgba(5,6,8,0) 100%)",
          pointerEvents: "none",
        }}
      >
        <button
          onClick={handleContinue}
          disabled={saving || selected.size === 0}
          style={{
            width: "100%",
            background: selected.size > 0 ? "#ccff00" : "rgba(255,255,255,0.1)",
            color: selected.size > 0 ? "#000" : "rgba(255,255,255,0.3)",
            fontSize: 15,
            fontWeight: 800,
            borderRadius: 16,
            padding: "15px 0",
            border: "none",
            cursor: saving || selected.size === 0 ? "not-allowed" : "pointer",
            boxShadow:
              selected.size > 0 ? "0 4px 20px rgba(204,255,0,0.3)" : "none",
            transition: "all 0.2s",
            pointerEvents: "auto",
          }}
        >
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
