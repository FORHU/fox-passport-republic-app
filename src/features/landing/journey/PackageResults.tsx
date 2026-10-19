"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { Money } from "@/shared/components/ui/Money";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { signUpThen } from "@/shared/auth/returnTo";
import { EVENT_TYPES, HeroSearch } from "./booking";
import type { LandingEvent } from "./data";

const formatDate = (value: string) => {
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
};

function PackageCard({ pkg, date }: { pkg: LandingEvent; date?: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const photo = pkg.images?.find((image) => image.url)?.url;
  const place = [pkg.targetCity, pkg.targetCountry].filter(Boolean).join(", ");

  // Booking needs an account; signed out, the account is created right here,
  // with this package beside the form, and the booking continues after.
  const reserve = () => {
    const path = `/booking/config?templateId=${pkg.id}`;
    if (user) router.push(path);
    else
      signUpThen(path, {
        title: pkg.name,
        image: photo,
        place,
        date,
        price: pkg.estimatedTotal,
      });
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface transition-colors hover:border-accent/50">
      <div className="aspect-[4/3] bg-white/5">
        {photo && (
          <img
            src={photo}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {place && (
          <p className="font-landing-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
            {place}
          </p>
        )}
        <h2 className="mt-1 text-xl font-bold text-white">{pkg.name}</h2>
        <p className="mt-3 text-sm text-white/65">
          {pkg.estimatedTotal ? (
            <>
              From{" "}
              <span className="text-lg font-bold text-white">
                <Money amount={pkg.estimatedTotal} />
              </span>
            </>
          ) : (
            "Price on request"
          )}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <Link
            href={`/event/${pkg.id}`}
            className="py-2 text-sm font-bold text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            View details
          </Link>
          <button
            type="button"
            onClick={reserve}
            className="cursor-pointer rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-black transition-transform active:scale-[0.98]"
          >
            Reserve
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * Package results for the hero search (what / where / when). Open to anyone:
 * prices first, an account only at Reserve. The API filters by kind and city;
 * the date isn't a filter, so availability is confirmed when they reserve.
 */
export default function PackageResults() {
  const params = useSearchParams();
  const category = params.get("category") ?? "";
  const city = params.get("city") ?? "";
  const startDate = params.get("startDate") ?? "";
  const date = startDate ? formatDate(startDate) : "";
  const kind = EVENT_TYPES.find((t) => t.value === category)?.label;

  const { data, isPending, isError } = useQuery({
    queryKey: ["packages", category, city],
    queryFn: async () => {
      const res = await api.get("/event-templates/browse", {
        params: {
          category: category || undefined,
          city: city || undefined,
          limit: 24,
        },
      });
      return (res.data?.data ?? []) as LandingEvent[];
    },
  });
  const packages = data ?? [];

  const summary = [`${kind ?? "Any event"}${city ? ` in ${city}` : ""}`, date]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <p className="font-landing-mono text-xs font-bold uppercase tracking-[0.2em] text-white/60">
        Your search
      </p>
      <p className="mt-2 text-lg text-white">{summary}</p>
      {/* key: a new search remounts it with the new values. */}
      <HeroSearch
        key={`${category}|${city}|${startDate}`}
        initial={{ what: category, where: city, when: startDate }}
      />

      <h1 className="font-landing-display mt-12 text-3xl text-white sm:text-4xl">
        {isPending
          ? "Finding packages…"
          : packages.length > 0
            ? `${packages.length} ${packages.length === 1 ? "package fits" : "packages fit"} your night`
            : "No packages match yet"}
      </h1>
      {date && packages.length > 0 && (
        <p className="mt-2 text-sm text-white/60">
          Availability for {date} is confirmed when you reserve.
        </p>
      )}

      {isPending && (
        <div
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-label="Loading packages"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-2xl border border-white/10 bg-surface"
            />
          ))}
        </div>
      )}

      {!isPending && packages.length === 0 && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-surface p-8 text-center">
          <p className="text-white/80">
            {isError
              ? "We couldn't load packages. Check your connection and try again."
              : "Try another city or kind of event, or see everything open to book."}
          </p>
          <Link
            href="/packages"
            className="mt-5 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-black"
          >
            See all packages
          </Link>
        </div>
      )}

      {packages.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} date={date || undefined} />
          ))}
        </div>
      )}
    </>
  );
}
