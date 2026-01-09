import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { BrandLogo } from '@/components/shared/BrandLogo';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', id: 'dashboard', badge: null },
  { label: 'Bookings', icon: 'confirmation_number', id: 'bookings', badge: '12' },
  { label: 'Citizens', icon: 'group', id: 'citizens', badge: null },
  { label: 'Events', icon: 'event', id: 'events', badge: null, section: 'Manage' },
  { label: 'Categories', icon: 'category', id: 'categories', badge: null },
  { label: 'Venues', icon: 'storefront', id: 'venues', badge: null },
  { label: 'Reports', icon: 'bar_chart', id: 'reports', badge: null, section: 'System' },
  { label: 'Settings', icon: 'settings', id: 'settings', badge: null },
];

export const AdminSidebar: React.FC = () => {
  const { sidebarOpen, activeAdminTab, setActiveAdminTab } = useUIStore();

  return (
    <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-surface/40 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col transition-transform duration-300 transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-24 flex items-center px-8 border-b border-white/5">
        <BrandLogo />
      </div>
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto hide-scrollbar">
        <div className="px-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-widest font-display">Main</div>
        {NAV_ITEMS.map((item, index) => (
          <React.Fragment key={item.id}>
            {item.section && (
              <div className="px-4 pt-6 pb-2 text-xs font-bold text-gray-500 uppercase tracking-widest font-display">{item.section}</div>
            )}
            <button 
              onClick={() => setActiveAdminTab(item.id)}
              className={`w-full nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${activeAdminTab === item.id ? 'text-white bg-white/10 active' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined group-hover:animate-wiggle">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-accent text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
              )}
            </button>
          </React.Fragment>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="bg-surface-highlight/50 rounded-2xl p-4 flex items-center gap-3 border border-white/5 cursor-pointer hover:border-accent/50 transition-colors group">
          <img alt="Admin" className="h-10 w-10 rounded-full object-cover border-2 border-transparent group-hover:border-accent transition-colors" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop" />
          <div className="overflow-hidden">
            <div className="font-bold text-sm text-white truncate">Admin User</div>
            <div className="text-xs text-text-muted truncate">admin@foxpassport.ph</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
