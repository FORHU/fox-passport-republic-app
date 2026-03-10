import React from 'react';

export const AdminChartsSection: React.FC = () => {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 glass-panel rounded-[2rem] p-8 border border-white/5">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-display font-bold text-white">Revenue Trends</h3>
            <p className="text-sm text-text-muted">Daily transaction volume</p>
          </div>
          <select className="bg-surface-highlight border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-accent focus:border-accent">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </div>
        <div className="h-64 flex items-end justify-between gap-4 px-2">
          {[
            { day: 'Mon', h: '40%' },
            { day: 'Tue', h: '65%' },
            { day: 'Wed', h: '35%' },
            { day: 'Thu', h: '85%', active: true },
            { day: 'Fri', h: '60%' },
            { day: 'Sat', h: '75%' },
            { day: 'Sun', h: '50%' },
          ].map((bar, i) => (
            <div key={i} className="w-full flex flex-col justify-end group gap-2 h-full">
              <div 
                className={`w-full bg-surface-highlight rounded-t-lg relative overflow-hidden chart-bar transition-all duration-500 ease-out`}
                style={{ height: bar.h }}
              >
                <div className={`absolute inset-0 bg-linear-to-t ${bar.active ? 'from-accent/50 to-accent/80 opacity-80' : 'from-primary/50 to-primary/80 opacity-60'} group-hover:opacity-100 transition-opacity ${bar.active ? 'shadow-[0_0_20px_rgba(204,255,0,0.2)]' : ''}`}></div>
              </div>
              <span className={`text-xs text-center ${bar.active ? 'text-white font-bold' : 'text-gray-500 font-medium'}`}>{bar.day}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="glass-panel rounded-[2rem] p-8 border border-white/5 flex flex-col h-full">
        <h3 className="text-xl font-display font-bold text-white mb-6">Popular Categories</h3>
        <div className="space-y-6 flex-1">
          {[
            { name: 'Parties & Socials', val: '45%', color: 'bg-secondary', shadow: 'rgba(219,39,119,0.8)' },
            { name: 'Tours & Excursions', val: '32%', color: 'bg-accent', shadow: 'rgba(204,255,0,0.8)' },
            { name: 'Festivals & Fairs', val: '15%', color: 'bg-primary', shadow: 'rgba(124,58,237,0.8)' },
            { name: 'Classes & Workshops', val: '8%', color: 'bg-blue-400', shadow: 'rgba(96,165,250,0.8)' },
          ].map((cat, i) => (
            <div key={i} className="group">
              <div className="flex justify-between items-end mb-2">
                <span className="font-medium text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cat.color}`} style={{ boxShadow: `0 0 8px ${cat.shadow}` }}></span>
                  {cat.name}
                </span>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{cat.val}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${cat.color} rounded-full`} style={{ width: cat.val, boxShadow: `0 0 10px ${cat.shadow.replace('0.8', '0.5')}` }}></div>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-6 w-full py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-all">
          View Detailed Report
        </button>
      </div>
    </div>
  );
};
