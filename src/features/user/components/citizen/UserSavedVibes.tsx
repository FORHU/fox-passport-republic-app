"use client";

import React, { useState } from "react";
import Image from "next/image";

interface SavedVibe {
  id: number;
  title: string;
  location: string;
  image: string;
  status: "open" | "upcoming" | "sold_out";
}

interface UserSavedVibesProps {
  savedVibes: SavedVibe[];
  className?: string;
}

const PAGE_SIZE = 4;

export const UserSavedVibes: React.FC<UserSavedVibesProps> = ({
  savedVibes,
  className = "",
}) => {
  const [requestedPage, setRequestedPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(savedVibes.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages - 1);

  const pageItems = savedVibes.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <section
      className={`reveal-on-scroll flex flex-col ${className}`}
      style={{ transitionDelay: "300ms" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-pink-400">
            favorite
          </span>
          Saved Vibes
        </h3>
        <span className="text-xs text-text-muted">
          {savedVibes.length} Items
        </span>
      </div>

      <div className="glass-panel rounded-[2.5rem] p-6 flex flex-col flex-1 h-full">
        {savedVibes.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-8 text-center">
            <span className="material-symbols-outlined text-4xl text-white/20 mb-3">
              favorite
            </span>
            <p className="text-sm font-bold text-white/40 mb-1">
              No saved vibes yet
            </p>
            <p className="text-xs text-text-muted">
              Bookmark events and venues to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pageItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-2 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer group"
              >
                <Image
                  className="h-16 w-16 rounded-xl object-cover group-hover:scale-105 transition-transform"
                  src={item.image}
                  alt={item.title}
                  width={64}
                  height={64}
                />
                <div className="flex-1">
                  <h4 className="text-white font-bold text-sm mb-1 group-hover:text-accent transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-text-muted mb-2">
                    {item.location}
                  </p>
                  {item.status === "open" && (
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                      <span className="text-[10px] text-green-500 font-bold">
                        Open Now
                      </span>
                    </div>
                  )}
                  {item.status === "upcoming" && (
                    <span className="text-[10px] text-gray-400">
                      Next Weekend
                    </span>
                  )}
                  {item.status === "sold_out" && (
                    <span className="text-[10px] text-red-400">Sold Out</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setRequestedPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Previous page"
            >
              <span className="material-symbols-outlined text-[16px]">
                chevron_left
              </span>
            </button>
            <span className="text-xs text-text-muted">
              Page {page + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setRequestedPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={page === totalPages - 1}
              className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Next page"
            >
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
