import React from 'react';

interface Transaction {
    type: 'purchase' | 'topup';
    amount: number;
    description?: string;
    label: string;
}

interface UserWalletProps {
    walletBalance: number;
    recentTransactions: Transaction[];
}

export const UserWallet: React.FC<UserWalletProps> = ({ walletBalance, recentTransactions }) => {
  return (
    <section className="reveal-on-scroll" style={{ transitionDelay: '100ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400">account_balance_wallet</span>
            Fox Wallet
        </h3>
        <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30">
            Active
        </span>
      </div>

      <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-indigo-900 to-purple-900 border border-white/10 p-6 shadow-glow hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-32 bg-accent opacity-10 blur-[80px] rounded-full"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      {/* Internal title removed */}
                      <h3 className="text-4xl font-display font-bold text-white tracking-tight">₱{walletBalance.toLocaleString()}<span className="text-lg text-indigo-300"></span></h3>
                    </div>
                    <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">account_balance_wallet</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button className="bg-accent text-black py-3 rounded-xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                      <span className="material-symbols-outlined text-[18px]">add</span> Top Up
                    </button>
                    <button className="bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">send</span> Send
                    </button>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Recent Activity</p>
                    {recentTransactions.map((tx, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full ${tx.type === 'purchase' ? 'bg-secondary/20' : 'bg-accent/20'} flex items-center justify-center`}>
                            <span className={`material-symbols-outlined ${tx.type === 'purchase' ? 'text-secondary' : 'text-accent'} text-xs`}>
                              {tx.type === 'purchase' ? 'local_activity' : 'add'}
                            </span>
                          </div>
                          <div className="text-sm text-white">{tx.label}</div>
                        </div>
                        <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-accent' : 'text-white'}`}>
                          {tx.amount > 0 ? '+' : ''} ₱{Math.abs(tx.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
    </section>
  );
};
