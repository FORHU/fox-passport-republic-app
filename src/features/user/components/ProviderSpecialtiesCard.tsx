"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { getApiErrorMessage } from "@/shared/lib/apiError";
import { PROFILE_QUERY_KEY } from "@/shared/auth/profile";
import { useProviderSpecialties } from "@/shared/api/providerSpecialties";

interface ProviderSpecialtiesCardProps {
  /** The Provider's specialties as `GET /profile` returns them. */
  current: { slug: string; name: string }[];
}

/**
 * A Provider's specialties in profile settings (RR-3): pick from the catalog,
 * at least one, no maximum. The API refuses removing the last one or one with
 * an upcoming booking, and its message is shown as is.
 */
export function ProviderSpecialtiesCard({
  current,
}: ProviderSpecialtiesCardProps) {
  const queryClient = useQueryClient();
  const { data: options = [], isLoading } = useProviderSpecialties();
  const saved = current.map((s) => s.slug);
  const [selected, setSelected] = useState<string[]>(saved);
  const [isSaving, setIsSaving] = useState(false);

  // Follow the saved list when the profile reloads.
  const savedKey = saved.join(",");
  useEffect(() => {
    setSelected(savedKey ? savedKey.split(",") : []);
  }, [savedKey]);

  const toggle = (slug: string) =>
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  const changed =
    selected.length !== saved.length ||
    selected.some((s) => !saved.includes(s));

  const save = async () => {
    if (selected.length === 0) {
      toast.error("Keep at least one specialty.");
      return;
    }
    setIsSaving(true);
    try {
      await api.put("/profile", { specialties: selected });
      await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      toast.success("Specialties saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't save your specialties."));
      setSelected(saved);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-surface border border-white/5 rounded-[2rem] p-5 sm:p-8 space-y-5">
      <div>
        <h2 className="text-lg font-display font-bold mb-1">Specialties</h2>
        <p className="text-sm text-white/40">
          What you offer as a Provider. Clients find you under each one. Keep at
          least one.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-white/40">Loading specialties…</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const isOn = selected.includes(opt.slug);
            return (
              <button
                key={opt.slug}
                type="button"
                aria-pressed={isOn}
                aria-label={opt.name}
                onClick={() => toggle(opt.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                  isOn
                    ? "bg-accent/15 border-accent/50 text-accent"
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {opt.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={!changed || isSaving}
          className="px-5 py-2.5 rounded-xl bg-accent text-black font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSaving ? "Saving…" : "Save Specialties"}
        </button>
      </div>
    </section>
  );
}

export default ProviderSpecialtiesCard;
