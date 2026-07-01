import React from 'react';

interface TimelineStep {
  icon: string;
  title: string;
  desc: string;
}

interface EscrowTimelineProps {
  steps?: TimelineStep[];
}

const DEFAULT_STEPS: TimelineStep[] = [
  { icon: 'assignment_turned_in', title: 'Booking Draft Created', desc: 'The venue owner reviews your dates and confirms availability.' },
  { icon: 'lock', title: 'Payment Held in Escrow', desc: 'Funds are secured — the owner cannot access them yet.' },
  { icon: 'where_to_vote', title: 'Confirm Arrival', desc: 'On event day, tap Confirm Arrival to release payment.' },
];

export function EscrowTimeline({ steps = DEFAULT_STEPS }: EscrowTimelineProps) {
  return (
    <div className="rounded-3xl border border-accent/20 bg-linear-to-b from-accent/5 to-black/20 overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-accent/10">
        <span className="material-symbols-outlined text-accent text-2xl">verified_user</span>
        <h4 className="text-white font-bold text-sm uppercase tracking-widest">What Happens Next</h4>
      </div>
      <div className="p-6 space-y-0">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                  i === 0 ? 'bg-accent text-black' : 'bg-white/5 border border-white/10 text-white/40'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
              </div>
              {i < steps.length - 1 && <div className="w-px flex-1 bg-white/10 my-1.5" />}
            </div>
            <div className="pb-5">
              <p className={`text-sm font-bold mb-0.5 ${i === 0 ? 'text-accent' : 'text-white/70'}`}>
                {step.title}
              </p>
              <p className="text-xs text-white/35 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
