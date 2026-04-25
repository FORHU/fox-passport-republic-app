import React from 'react';

interface CategoriesTableProps {
  categories: any[];
  isLoading: boolean;
}

export const AdminCategoriesTable: React.FC<CategoriesTableProps> = ({ categories, isLoading }) => {
  if (isLoading) {
    return <div className="p-8 text-center text-white/50">Loading categories...</div>;
  }

  return (
    <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5">
      <div className="p-6 border-b border-white/5">
        <h3 className="text-xl font-display font-bold text-white">Categories Configuration</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-text-muted text-xs uppercase tracking-wider">
              <th className="p-6 font-medium">Icon</th>
              <th className="p-6 font-medium">Name</th>
              <th className="p-6 font-medium">Slug</th>
              <th className="p-6 font-medium">Description</th>
              <th className="p-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-white/30">No categories found in database</td>
              </tr>
            ) : (
              categories.map((cat, i) => (
                <tr key={cat.id ?? cat.slug ?? i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-[0_0_15px_rgba(204,255,0,0.1)]">
                      <span className="material-symbols-outlined">{cat.icon || 'category'}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="font-bold text-white group-hover:text-accent transition-colors">{cat.name}</span>
                  </td>
                  <td className="p-6 text-gray-400 font-mono text-xs">{cat.slug}</td>
                  <td className="p-6 text-gray-300 max-w-xs truncate">{cat.description || "—"}</td>
                  <td className="p-6 text-right">
                    <button className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
