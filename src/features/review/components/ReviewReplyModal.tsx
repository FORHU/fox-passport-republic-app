'use client';

import React, { useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { ReviewReply } from '@/features/review/api/reviews';

interface ReviewReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  review?: {
    id: string;
    userId: string;
    user?: { name: string; imgId?: string };
    rating: number;
    comment: string;
    createdAt: string;
    replies?: ReviewReply[];
  } | null;
  reply?: ReviewReply | null;
}

export default function ReviewReplyModal({ isOpen, onClose, review, reply }: ReviewReplyModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (reply) {
    const replyInitials = (reply.user?.name ?? 'A').charAt(0).toUpperCase();
    const replyDate = new Date(reply.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative glass-panel rounded-2xl border border-white/10 p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-display font-bold text-white mb-4">Host Reply</h3>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              {reply.user?.imgId ? (
                <img src={reply.user.imgId} className="w-10 h-10 rounded-full object-cover" alt={reply.user.name} />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                  {replyInitials}
                </div>
              )}
              <div>
                <h4 className="font-bold text-white text-sm">{reply.user?.name ?? 'Anonymous'}</h4>
                <span className="text-xs text-text-muted">{replyDate}</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{reply.text}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!review) return null;

  const initials = (review.user?.name ?? 'A').charAt(0).toUpperCase();
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative glass-panel rounded-2xl border border-white/10 p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-display font-bold text-white mb-4">Review</h3>

        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            {review.user?.imgId ? (
              <img
                src={review.user.imgId}
                className="w-10 h-10 rounded-full object-cover"
                alt={review.user.name}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                {initials}
              </div>
            )}
            <div>
              <h4 className="font-bold text-white text-sm">{review.user?.name ?? 'Anonymous'}</h4>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-white/20 text-white/20'}`}
                  />
                ))}
                <span className="text-xs text-text-muted ml-1">{date}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{review.comment}</p>
        </div>

        {review.replies && review.replies.length > 0 && (
          <div className="mb-4 space-y-3 border-t border-white/5 pt-4">
            <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">
              Replies ({review.replies.length})
            </h4>
            {review.replies.map((r) => {
              const ri = (r.user?.name ?? 'A').charAt(0).toUpperCase();
              return (
                <div key={r.id} className="flex gap-3 pl-4 border-l-2 border-accent/30">
                  {r.user?.imgId ? (
                    <img src={r.user.imgId} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" alt={r.user.name} />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-[10px] shrink-0 mt-0.5">
                      {ri}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{r.user?.name ?? 'Anonymous'}</span>
                      <span className="text-[10px] text-text-muted">
                        {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5">{r.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
