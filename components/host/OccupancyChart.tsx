"use client";

import React from "react";

const OccupancyChart = () => {
  return (
    <section className="h-full flex-1 flex flex-col">
      <div className="glass-card rounded-[2rem] p-8 border border-white/5 h-full flex-1 flex flex-col">
        <div className="flex flex-wrap justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-display font-bold text-white mb-1">
              Occupancy Rate
            </h2>
            <p className="text-sm text-text-muted">Average capacity usage</p>
          </div>
          <select className="bg-black/30 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 focus:ring-accent focus:border-accent">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Year to Date</option>
          </select>
        </div>
        <div className="flex items-end justify-between h-48 gap-2 sm:gap-4 w-full">
          {[
            { day: "Mon", h: "30%" },
            { day: "Tue", h: "45%" },
            { day: "Wed", h: "40%" },
            { day: "Thu", h: "70%" },
            { day: "Fri", h: "90%", active: true },
            { day: "Sat", h: "95%" },
            { day: "Sun", h: "60%" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="w-full flex flex-col justify-end group gap-2 h-full"
            >
              <div
                className={`w-full rounded-t-lg relative overflow-hidden transition-all duration-500 ease-out ${
                  item.active 
                    ? "bg-gradient-to-t from-[#db2777] to-[#f472b6] shadow-[0_0_15px_rgba(219,39,119,0.4)]" 
                    : "bg-gradient-to-t from-[#7c3aed] to-[#a855f7] hover:shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                }`}
                style={{ height: item.h }}
              >
              </div>
              <span className={`text-xs text-center font-medium ${item.active ? "text-secondary" : "text-text-muted"}`}>
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OccupancyChart;
