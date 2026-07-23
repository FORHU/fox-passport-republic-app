'use client';

import React from 'react';

interface EventHeaderProps {
  eventTitle: string;
  isSubmitting: boolean;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export function EventHeader({
  eventTitle,
  isSubmitting,
  saveStatus = 'idle',
  onBack,
  onSaveDraft,
  onPublish,
}: EventHeaderProps) {
  const statusLabel =
    saveStatus === 'saving' ? 'Saving…' :
    saveStatus === 'saved'  ? 'Draft saved' :
    saveStatus === 'error'  ? 'Save failed — retry?' :
    'Draft';

  const statusDot =
    saveStatus === 'saving' ? 'bg-yellow-400 animate-pulse' :
    saveStatus === 'error'  ? 'bg-red-500' :
    'bg-green-500 animate-pulse';

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f111a] z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </button>
        <div>
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            Event Studio
            <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[9px] font-bold uppercase">
              Beta
            </span>
          </h2>
          <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
            {eventTitle || 'Untitled Event'} · {statusLabel}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={onSaveDraft}
          className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold hover:bg-white/5"
        >
          Save Draft
        </button>
        <button
          onClick={onPublish}
          disabled={isSubmitting}
          className="btn-neon px-5 py-2 rounded-full bg-accent text-black text-xs font-bold flex items-center gap-2"
        >
          {isSubmitting ? (
            <span className="material-symbols-outlined animate-spin text-[16px]">
              progress_activity
            </span>
          ) : (
            'Publish Event'
          )}
        </button>
      </div>
    </header>
  );
}
