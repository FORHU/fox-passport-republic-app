"use client";

import React, { useEffect, useState } from "react";
import {
  AuditEntry,
  AuditedResource,
  fetchAuditHistory,
} from "@/shared/api/audit";

/**
 * The change history of one fee rule or promotion: who, when, and what
 * changed. `fields` maps the record's keys to the labels worth showing; an
 * update lists only the labelled fields whose value actually changed.
 */

function show(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleDateString();
  }
  return String(value);
}

function describe(entry: AuditEntry, fields: Record<string, string>): string[] {
  const m = entry.metadata ?? {};
  const verb = entry.action.split(".")[1];

  if (entry.action === "voucher.setActive") {
    return [`Code ${m.code} turned ${m.active ? "on" : "off"}`];
  }
  if (entry.action === "voucher.generate") {
    return [`Generated ${m.codes?.length ?? 0} codes`];
  }
  if (entry.action === "voucher.import") {
    const skipped = m.skipped?.length ? `, skipped ${m.skipped.length}` : "";
    return [`Imported ${m.codes?.length ?? 0} codes${skipped}`];
  }
  if (verb === "create") return ["Created"];
  if (verb === "deactivate") return ["Deactivated"];

  const prev = m.previous ?? {};
  const cur = m.current ?? {};
  const changes = Object.entries(fields)
    .filter(([key]) => show(prev[key]) !== show(cur[key]))
    .map(([key, label]) => `${label}: ${show(prev[key])} → ${show(cur[key])}`);
  return changes.length > 0 ? changes : ["Saved with no visible change"];
}

export default function AuditHistoryPanel({
  resource,
  id,
  fields,
}: {
  resource: AuditedResource;
  id: string;
  fields: Record<string, string>;
}) {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    fetchAuditHistory(resource, id)
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [resource, id]);

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">
        Change history
      </h4>
      {entries === null ? (
        <p className="text-white/20 text-xs">Loading history…</p>
      ) : entries.length === 0 ? (
        <p className="text-white/20 text-xs">No recorded changes yet.</p>
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="bg-white/5 rounded-lg px-3 py-2 text-xs"
            >
              <div className="flex flex-wrap justify-between gap-x-3 text-white/40">
                <span className="truncate">{entry.actorEmail}</span>
                <span>{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
              {describe(entry, fields).map((line) => (
                <div key={line} className="text-white/80 mt-0.5">
                  {line}
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
