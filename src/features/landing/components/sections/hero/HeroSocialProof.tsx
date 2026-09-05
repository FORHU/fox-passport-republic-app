/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";

export function HeroSocialProof() {
  return (
    <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
      <div className="flex -space-x-4 hover:space-x-0 transition-all duration-500">
        <img
          alt="User"
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-A0KmDrOi8KQZt5YVraaoL54kpKL4sLPhBoZj6kgs089hsWPz2qJfdMww3r4NpGGBYTSIrptbwjoMo0ZmnZFpuLCt3lExTQAv1QauCbCl6k3vscDYH5z0t7EqZ-NulKXiQjy8VxqCwlvvy4h_vf5j2Lf7cN1haDT24rR_FzF8rO9swBYh5KVGtV09ogFZmVJAcrnGZCXHQEkJR8TzFmrSMkK0jRaOzO43L1j7KQZ0WraTBcdonNTmEh2phQsvKrYuVv6P1wDPPAM"
        />
        <img
          alt="User"
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAawAmjQLUXCUHrFlbDS_ydJnuUpm_WUNW9I5alXTGfJCNDU8_Gnn4cey4Tt_fcRefnkP3AK4S1C13YiOGOnCLmz3aSgwJP_JwChCJBNSCeFugn97n0lpqg6JVBy926WV4xcXgfaLeBW6GNWknG__nTJeUYtmKctJxCDA5ODZq2ZxpowxJKzUXEpcS9W1ThdbCuR0rXQTeqeW2URDNRYLxCNmXPoWUlxq_9LdMzamdZIYkwK2XK3b0k_kVV4njSFnmyGojp2293vrU"
        />
        <img
          alt="User"
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgd--zxF5w1ZztnRmVlmV-feUqN_qBWaBYUT5CujXc0w-0AUuWAmHt_hqnGMMe6m_fRhEWkVx4s-GPtdMKYzlfSOQqHXDOj1gZA2nyUJx9g-k_T2GXeIiYRFWE4OhzISNwTdKHnUtx3za3LKNh05jbmOS4npA_2XzCQ6-b0jqwzXF4Zy5LKfBRtJpHKvZknn8VWcB24VzWfO5VUZJ4zVgdHD766vR4O1OP3A6j3meIxBZLNL5KDybSUXLKzRdPbfxAQ2NIKRBRKsA"
        />
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-surface-highlight text-white border-2 border-background text-[10px] sm:text-xs font-bold hover:bg-[#ccff00] hover:text-black transition-colors cursor-pointer">
          +2k
        </div>
      </div>
      <div className="text-xs sm:text-sm font-medium text-text-muted group cursor-default">
        <div className="flex text-[#ccff00] mb-0.5 group-hover:gap-0.5 transition-all">
          <span className="material-symbols-outlined text-[14px] sm:text-[18px] fill-current animate-pulse">
            star
          </span>
          <span className="material-symbols-outlined text-[14px] sm:text-[18px] fill-current animate-pulse delay-75">
            star
          </span>
          <span className="material-symbols-outlined text-[14px] sm:text-[18px] fill-current animate-pulse delay-100">
            star
          </span>
          <span className="material-symbols-outlined text-[14px] sm:text-[18px] fill-current animate-pulse delay-150">
            star
          </span>
          <span className="material-symbols-outlined text-[14px] sm:text-[18px] fill-current animate-pulse delay-200">
            star
          </span>
        </div>
        Verified by Citizens
      </div>
    </div>
  );
}
