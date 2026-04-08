import React from 'react';
import { getProgressPercentage } from '@/lib/gamification';

interface CircularProgressProps {
  level: number;
  currentXP: number;
  requiredXP: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export default function CircularProgress({
  level,
  currentXP,
  requiredXP,
  color,
  size = 192,
  strokeWidth = 12,
  showLabel = true,
  className = '',
}: CircularProgressProps) {
  const progress = getProgressPercentage(currentXP, requiredXP);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-display font-bold text-white group-hover:scale-110 transition-transform">
            {level}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
            Level
          </span>
        </div>
      )}
    </div>
  );
}
