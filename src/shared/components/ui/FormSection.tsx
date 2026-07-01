import React from 'react';

interface FormSectionProps {
  icon: string;
  title: string;
  children: React.ReactNode;
  accent?: string;
  className?: string;
  iconClassName?: string;
}

export function FormSection({
  icon,
  title,
  children,
  className = '',
  iconClassName = 'text-accent',
}: FormSectionProps) {
  return (
    <div className={`glass-card rounded-[2rem] p-8 border border-white/10 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <span className={`material-symbols-outlined ${iconClassName} text-2xl`}>{icon}</span>
        <h3 className="text-xl font-display font-bold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}
