'use client';

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({ page, totalPages, onPageChange }: PaginationBarProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-6 px-1">
      <span className="text-xs text-white/40">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:border-[#ccff00] hover:text-[#ccff00] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-8 w-8 rounded-full text-xs font-bold transition-all ${
              p === page
                ? 'bg-[#ccff00] text-black'
                : 'border border-white/10 text-white/60 hover:border-[#ccff00] hover:text-[#ccff00]'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:border-[#ccff00] hover:text-[#ccff00] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
