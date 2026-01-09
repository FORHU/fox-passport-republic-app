import React from 'react';
import Image from 'next/image';

export const UserNextUp: React.FC = () => {
  return (
    <section className="reveal-on-scroll">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent animate-pulse">airplane_ticket</span>
                    Next Up
                  </h3>
                  <a className="text-sm text-gray-400 hover:text-white transition-colors" href="#">View all tickets</a>
                </div>
                <div className="glass-ticket rounded-3xl p-0 flex flex-col md:flex-row overflow-hidden group hover:shadow-[0_0_40px_rgba(124,58,237,0.2)] transition-all duration-500">
                  <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
                    <Image 
                      alt="Event" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U"
                      width={400}
                      height={300}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-6 left-6">
                      <span className="bg-accent text-black text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">TOMORROW</span>
                      <h2 className="text-2xl font-bold text-white font-display leading-tight">Neon Nights: Retro Wave Party</h2>
                    </div>
                  </div>
                  <div className="relative w-full md:w-3/5 p-8 flex flex-col justify-between border-l border-white/10 border-dashed">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Location</p>
                        <p className="text-white font-bold text-lg flex items-center gap-1">
                          <span className="material-symbols-outlined text-accent text-sm">location_on</span>
                          Club XYZ, Makati
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm mb-1">Time</p>
                        <p className="text-white font-bold text-lg">9:00 PM</p>
                      </div>
                    </div>
                    <div className="my-6 border-t border-white/10 border-dashed"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-3">
                        <Image 
                          className="w-10 h-10 rounded-full border-2 border-surface object-cover" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAawAmjQLUXCUHrFlbDS_ydJnuUpm_WUNW9I5alXTGfJCNDU8_Gnn4cey4Tt_fcRefnkP3AK4S1C13YiOGOnCLmz3aSgwJP_JwChCJBNSCeFugn97n0lpqg6JVBy926WV4xcXgfaLeBW6GNWknG__nTJeUYtmKctJxCDA5ODZq2ZxpowxJKzUXEpcS9W1ThdbCuR0rXQTeqeW2URDNRYLxCNmXPoWUlxq_9LdMzamdZIYkwK2XK3b0k_kVV4njSFnmyGojp2293vrU"
                          alt="Friend 1"
                          width={40}
                          height={40}
                        />
                        <Image 
                          className="w-10 h-10 rounded-full border-2 border-surface object-cover" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgd--zxF5w1ZztnRmVlmV-feUqN_qBWaBYUT5CujXc0w-0AUuWAmHt_hqnGMMe6m_fRhEWkVx4s-GPtdMKYzlfSOQqHXDOj1gZA2nyUJx9g-k_T2GXeIiYRFWE4OhzISNwTdKHnUtx3za3LKNh05jbmOS4npA_2XzCQ6-b0jqwzXF4Zy5LKfBRtJpHKvZknn8VWcB24VzWfO5VUZJ4zVgdHD766vR4O1OP3A6j3meIxBZLNL5KDybSUXLKzRdPbfxAQ2NIKRBRKsA"
                          alt="Friend 2"
                          width={40}
                          height={40}
                        />
                        <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-highlight flex items-center justify-center text-xs font-bold text-white">+3</div>
                      </div>
                      <button className="bg-white/10 hover:bg-white hover:text-black text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 group/btn">
                        <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                        Show Pass
                      </button>
                    </div>
                  </div>
                </div>
              </section>
  );
};
