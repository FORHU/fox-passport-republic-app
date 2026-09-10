import React from "react";

interface UserWelcomeProps {
  upcomingEventsCount: number;
  recommendationsCount: number;
}

export const UserWelcome: React.FC<UserWelcomeProps> = ({
  upcomingEventsCount,
  recommendationsCount,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-end mb-10 reveal-on-scroll">
      <div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
          Ready for the{" "}
          <span className="text-gradient-lime relative inline-block">
            weekend?
          </span>
        </h1>
        <p className="text-text-muted mt-2 text-lg">
          You have{" "}
          <span className="text-white font-bold">
            {upcomingEventsCount} upcoming events
          </span>{" "}
          and{" "}
          <span className="text-white font-bold">
            {recommendationsCount} recommendations
          </span>
          .
        </p>
      </div>
    </div>
  );
};
