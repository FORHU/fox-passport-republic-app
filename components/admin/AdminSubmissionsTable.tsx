import React from 'react';

export const AdminSubmissionsTable: React.FC = () => {
  return (
    <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5">
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-display font-bold text-white">Recent Event Submissions</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-full bg-white/5 text-xs font-bold text-white hover:bg-white hover:text-black transition-colors">All</button>
          <button className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-text-muted hover:text-white transition-colors">Pending</button>
          <button className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-text-muted hover:text-white transition-colors">Approved</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-text-muted text-xs uppercase tracking-wider">
              <th className="p-6 font-medium">Event Name</th>
              <th className="p-6 font-medium">Category</th>
              <th className="p-6 font-medium">Date</th>
              <th className="p-6 font-medium">Organizer</th>
              <th className="p-6 font-medium">Status</th>
              <th className="p-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
              <td className="p-6">
                <div className="flex items-center gap-3">
                  <img alt="Event" className="h-10 w-10 rounded-lg object-cover" src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop" />
                  <span className="font-bold text-white group-hover:text-accent transition-colors">Neon Nights: Retro Wave</span>
                </div>
              </td>
              <td className="p-6 text-gray-300">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Parties & Socials
                </span>
              </td>
              <td className="p-6 text-gray-300">Aug 30, 2024</td>
              <td className="p-6 text-gray-300">Vibe Check Inc.</td>
              <td className="p-6">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Approved
                </span>
              </td>
              <td className="p-6 text-right">
                <button className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </td>
            </tr>
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
              <td className="p-6">
                <div className="flex items-center gap-3">
                  <img alt="Event" className="h-10 w-10 rounded-lg object-cover" src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&auto=format&fit=crop" />
                  <span className="font-bold text-white group-hover:text-accent transition-colors">Coffee Tasting Workshop</span>
                </div>
              </td>
              <td className="p-6 text-gray-300">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Classes & Workshops
                </span>
              </td>
              <td className="p-6 text-gray-300">Sep 05, 2024</td>
              <td className="p-6 text-gray-300">Bean & Leaf Co.</td>
              <td className="p-6">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20">
                  <span className="material-symbols-outlined text-[14px]">hourglass_top</span> Pending
                </span>
              </td>
              <td className="p-6 text-right">
                <button className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </td>
            </tr>
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
              <td className="p-6">
                <div className="flex items-center gap-3">
                  <img alt="Event" className="h-10 w-10 rounded-lg object-cover" src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=100&auto=format&fit=crop" />
                  <span className="font-bold text-white group-hover:text-accent transition-colors">Stargazing Camp</span>
                </div>
              </td>
              <td className="p-6 text-gray-300">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> Tours & Excursions
                </span>
              </td>
              <td className="p-6 text-gray-300">Sep 10, 2024</td>
              <td className="p-6 text-gray-300">Outdoor Adventures Ph</td>
              <td className="p-6">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Approved
                </span>
              </td>
              <td className="p-6 text-right">
                <button className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-white/5 flex justify-center">
        <button className="text-sm text-text-muted hover:text-accent font-medium transition-colors flex items-center gap-1">
          View All Submissions <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
