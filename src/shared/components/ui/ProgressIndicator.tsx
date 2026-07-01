import React from 'react';
import Link from 'next/link';

interface StepConfig {
  number: number;
  label: string;
  href?: string;
  isCheck?: boolean;
}

interface ProgressIndicatorProps {
  steps: [StepConfig, ...StepConfig[]];
  currentStep: number;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-4 bg-surface-highlight/30 px-6 py-3 rounded-full border border-white/5">
      {steps.map((step, i) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;
        const Wrapper = step.href ? Link : 'div';

        return (
          <React.Fragment key={step.number}>
            {i > 0 && <div className="w-8 h-px bg-white/10" />}
            <Wrapper
              href={step.href ?? '#'}
              className={`flex items-center gap-2 ${step.href ? 'group cursor-pointer' : ''}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-accent text-black shadow-[0_0_10px_#ccff00]'
                    : isCompleted
                      ? 'bg-accent text-black'
                      : 'bg-white/10 text-white'
                }`}
              >
                {step.isCheck || (isCompleted && step.number < currentStep)
                  ? <span className="material-symbols-outlined text-[14px]">check</span>
                  : step.number}
              </span>
              <span
                className={`text-sm font-bold transition-colors ${
                  isCurrent ? 'text-white' : 'text-text-muted'
                } ${step.href ? 'group-hover:text-white' : ''}`}
              >
                {step.label}
              </span>
            </Wrapper>
          </React.Fragment>
        );
      })}
    </div>
  );
}
