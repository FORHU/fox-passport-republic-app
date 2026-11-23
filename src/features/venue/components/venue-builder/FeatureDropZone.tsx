"use client";

import React from "react";
import { ResourceItem } from "@/features/venue/data/venueBuilderData";
import { Money } from "@/shared/components/ui/Money";

interface FeatureDropZoneProps {
  type: "included" | "addon";
  items: ResourceItem[];
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, zone: "included" | "addon") => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem?: (id: string, updates: Partial<ResourceItem>) => void;
}

export function FeatureDropZone({
  type,
  items,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveItem,
  onUpdateItem,
}: FeatureDropZoneProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editValue, setEditValue] = React.useState("");
  const isIncluded = type === "included";
  const title = isIncluded ? "Standard Features" : "Monetized Add-ons";
  const subtitle = isIncluded
    ? "Included in base rental — values are for reference only and don't add to your revenue projection."
    : "Optional paid upgrades — their value feeds into Add-on Revenue in the projector.";
  const icon = isIncluded ? "check_circle" : "monetization_on";
  const iconColor = isIncluded ? "text-accent" : "text-secondary";
  const itemBgColor = isIncluded
    ? "bg-accent/10 text-accent"
    : "bg-secondary/10 text-secondary";
  const emptyIcon = isIncluded ? "add_home_work" : "shopping_cart";
  const emptyText = isIncluded
    ? "Drop zones, amenities here"
    : "Drop extra staff, special gear here";
  const borderColor = isDragOver
    ? isIncluded
      ? "border-accent bg-accent/5"
      : "border-secondary bg-secondary/5"
    : "border-white/10 bg-surface/30";

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, type)}
      className={`min-h-[160px] rounded-[2rem] border-2 border-dashed transition-all p-8 relative ${borderColor}`}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className={`material-symbols-outlined ${iconColor}`}>
              {icon}
            </span>
            {title}
          </h3>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
        <span className="bg-white/5 text-white/70 px-3 py-1 rounded-full text-xs font-bold border border-white/5">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-20 text-text-muted pointer-events-none">
          <span className="material-symbols-outlined text-3xl mb-2 opacity-30">
            {emptyIcon}
          </span>
          <p className="text-sm opacity-50">{emptyText}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="bg-surface-raised border border-white/5 rounded-xl p-3"
            >
              {editingId === item.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 text-xs text-white focus:border-accent outline-none"
                  />
                  {item.category !== "rules" && (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Price"
                      className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 text-xs text-white focus:border-accent outline-none font-mono"
                    />
                  )}
                  <div className="flex gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (editName.trim()) {
                          onUpdateItem?.(item.id, {
                            name: editName.trim(),
                            value: Number(editValue) || 0,
                          });
                        }
                        setEditingId(null);
                      }}
                      className="px-2 py-0.5 rounded bg-accent text-black font-bold text-[10px]"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-white/5 ${itemBgColor}`}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">
                          {item.icon}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">
                        {item.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-1.5">
                    {item.category !== "rules" && (
                      <p className="text-[10px] text-text-muted font-mono">
                        {!isIncluded && "Upsell: "}
                        <Money amount={item.value} />
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditName(item.name);
                        setEditValue(String(item.value));
                      }}
                      className="text-white/20 hover:text-accent p-1.5 rounded-full transition-all"
                      title="Edit item name and price"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-white/20 hover:text-red-400 p-1.5 rounded-full transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
