import React from 'react';

interface UserWelcomeProps {
    upcomingEventsCount: number;
    recommendationsCount: number;
    weather: {
        temp: string;
        condition: string;
    };
}

export const UserWelcome: React.FC<UserWelcomeProps> = ({ upcomingEventsCount, recommendationsCount, weather }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-end mb-10 reveal-on-scroll">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
                Ready for the <span className="text-gradient-lime relative inline-block">weekend?</span>
              </h1>
              <p className="text-text-muted mt-2 text-lg">You have <span className="text-white font-bold">{upcomingEventsCount} upcoming events</span> and <span className="text-white font-bold">{recommendationsCount} recommendations</span>.</p>
            </div>
            <div className="hidden md:flex gap-4 mt-6 md:mt-0">
              <div className="bg-surface-highlight/40 rounded-2xl p-4 border border-white/5 flex items-center gap-4 min-w-[200px]">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <span className="material-symbols-outlined">sunny</span>
                </div>
                <div>
                  <div className="text-xs text-text-muted uppercase font-bold">Weather</div>
                  <div className="text-white font-bold">{weather.temp} {weather.condition}</div>
                </div>
              </div>
            </div>
          </div>
  );
};
