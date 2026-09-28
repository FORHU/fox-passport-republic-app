"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import FileUploader from "@/shared/components/layout/FileUploader";
import { fetchVenueById, updateVenue } from "@/features/venue/api/venues";

/**
 * How a Venue is described and shown — the part of it an Organizer with
 * `venue:edit-listing` may change (the API's ORGANIZER_EDITABLE_VENUE_FIELDS,
 * docs/adr/0005). Name, capacity, prices, location, status and policies are
 * the Mayor's, and are not offered here; the API refuses them from anyone else.
 */

const MAX_PHOTOS = 5;

interface Photo {
  id: string;
  url?: string;
}

interface Details {
  description: string;
  amenities: string;
  facilities: string;
  parkingInformation: string;
  accessibilityInformation: string;
  entranceInstructions: string;
}

const EMPTY: Details = {
  description: "",
  amenities: "",
  facilities: "",
  parkingInformation: "",
  accessibilityInformation: "",
  entranceInstructions: "",
};

function toDetails(venue: any): Details {
  const list = (v: unknown) => (Array.isArray(v) ? v.join(", ") : "");
  return {
    description: venue?.description ?? "",
    amenities: list(venue?.amenities),
    facilities: list(venue?.facilities),
    parkingInformation: venue?.parkingInformation ?? "",
    accessibilityInformation: venue?.accessibilityInformation ?? "",
    entranceInstructions: venue?.entranceInstructions ?? "",
  };
}

function toPhotos(venue: any): Photo[] {
  const images = venue?.images ?? venue?.venueImages ?? [];
  return Array.isArray(images)
    ? images
        .map((img: any) => ({ id: img?.id, url: img?.url ?? img?.imageUrl }))
        .filter((p: Photo) => !!p.id)
    : [];
}

const splitList = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const TEXT_FIELDS: {
  key: keyof Details;
  label: string;
  hint?: string;
  rows: number;
}[] = [
  { key: "description", label: "Description", rows: 5 },
  {
    key: "amenities",
    label: "Amenities",
    hint: "Comma-separated, e.g. Wi-Fi, Air conditioning, Projector",
    rows: 2,
  },
  {
    key: "facilities",
    label: "Facilities",
    hint: "Comma-separated, e.g. Kitchen, Green room, Restrooms",
    rows: 2,
  },
  { key: "parkingInformation", label: "Parking", rows: 2 },
  { key: "accessibilityInformation", label: "Accessibility", rows: 2 },
  { key: "entranceInstructions", label: "Getting in", rows: 2 },
];

export function VenueListingDetailsForm({ venueId }: { venueId: string }) {
  const queryClient = useQueryClient();
  const venueQuery = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => fetchVenueById(venueId),
  });

  const initialDetails = useMemo(
    () => (venueQuery.data ? toDetails(venueQuery.data) : EMPTY),
    [venueQuery.data],
  );
  const initialPhotos = useMemo(
    () => (venueQuery.data ? toPhotos(venueQuery.data) : []),
    [venueQuery.data],
  );

  const [details, setDetails] = useState<Details>(EMPTY);
  const [photos, setPhotos] = useState<Photo[]>([]);
  // Remounts the uploader after each photo, so it is ready for the next one.
  const [uploaderKey, setUploaderKey] = useState(0);

  useEffect(() => {
    setDetails(initialDetails);
    setPhotos(initialPhotos);
  }, [initialDetails, initialPhotos]);

  const changes = useMemo(() => {
    const out: Record<string, unknown> = {};
    for (const { key } of TEXT_FIELDS) {
      if (details[key] === initialDetails[key]) continue;
      out[key] =
        key === "amenities" || key === "facilities"
          ? splitList(details[key])
          : details[key];
    }
    const ids = photos.map((p) => p.id);
    if (ids.join() !== initialPhotos.map((p) => p.id).join()) {
      out.imgIds = ids;
    }
    return out;
  }, [details, photos, initialDetails, initialPhotos]);

  const hasChanges = Object.keys(changes).length > 0;

  const save = useMutation({
    mutationFn: () => updateVenue(venueId, changes),
    onSuccess: () => {
      toast.success("Listing updated");
      queryClient.invalidateQueries({ queryKey: ["venue", venueId] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Could not save the listing"),
  });

  if (venueQuery.isLoading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-[#0f111a] p-8 flex items-center gap-2 text-xs text-white/40">
        <Loader2 className="w-4 h-4 animate-spin text-accent" />
        Loading the listing…
      </div>
    );
  }
  if (venueQuery.isError) {
    return (
      <div className="rounded-[2rem] border border-red-500/20 bg-[#0f111a] p-8 text-xs text-red-300/80">
        Couldn&apos;t load this venue&apos;s listing.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (hasChanges) save.mutate();
      }}
      className="rounded-[2rem] border border-white/10 bg-[#0f111a] p-8 space-y-6"
    >
      <div>
        <h3 className="font-display font-bold text-white text-lg">
          Listing details
        </h3>
        <p className="text-xs text-text-muted">
          How the venue is described and shown. Its name, capacity, prices and
          location stay with the Mayor.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold text-white/80">
          Photos{" "}
          <span className="font-normal text-white/40">
            ({photos.length}/{MAX_PHOTOS})
          </span>
        </p>
        {photos.length > 0 && (
          <ul className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {photos.map((p) => (
              <li
                key={p.id}
                className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10"
              >
                {p.url ? (
                  <img
                    src={p.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/40">
                    New photo
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setPhotos((prev) => prev.filter((x) => x.id !== p.id))
                  }
                  aria-label="Remove photo"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {photos.length < MAX_PHOTOS && (
          <FileUploader
            key={uploaderKey}
            label="Add a photo"
            accept="image/*"
            onUploadComplete={(id) => {
              setPhotos((prev) => [...prev, { id }]);
              setUploaderKey((k) => k + 1);
            }}
          />
        )}
      </div>

      {TEXT_FIELDS.map(({ key, label, hint, rows }) => (
        <div key={key} className="space-y-1.5">
          <label
            htmlFor={`venue-${key}`}
            className="text-sm font-bold text-white/80"
          >
            {label}
          </label>
          {hint && <p className="text-xs text-white/40">{hint}</p>}
          <textarea
            id={`venue-${key}`}
            rows={rows}
            value={details[key]}
            onChange={(e) =>
              setDetails((prev) => ({ ...prev, [key]: e.target.value }))
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/40 resize-y"
          />
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!hasChanges || save.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-black text-sm font-bold hover:bg-accent/90 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          {save.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save changes
        </button>
      </div>
    </form>
  );
}
