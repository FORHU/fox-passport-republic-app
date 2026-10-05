"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { RoleCatalogEntry } from "../roleCatalog";

interface RoleDetailsModalProps {
  /** The role being looked at; the modal is closed while this is null. */
  role: RoleCatalogEntry | null;
  onClose: () => void;
}

/**
 * Shown when a citizen picks a role to apply for: what the role actually
 * involves and what the application will ask for, before they commit to the
 * form.
 */
export function RoleDetailsModal({ role, onClose }: RoleDetailsModalProps) {
  return (
    <Dialog.Root open={!!role} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        {role && (
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 max-h-[85vh] overflow-y-auto rounded-[1.5rem] border border-white/10 bg-surface p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
            <Dialog.Close
              aria-label="Close"
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>

            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${role.color}20` }}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ color: role.color }}
              >
                {role.icon}
              </span>
            </div>
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: role.color }}
            >
              {role.tag}
            </p>
            <Dialog.Title className="text-2xl font-display font-bold text-white mb-1">
              {role.title}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-white/50 mb-6">
              {role.desc}
            </Dialog.Description>

            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-2">
              What you&apos;ll do
            </h3>
            <ul className="space-y-2 mb-6">
              {role.responsibilities.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-white/70">
                  <span
                    className="material-symbols-outlined text-[18px] shrink-0"
                    style={{ color: role.color }}
                  >
                    check_circle
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-2">
              What you&apos;ll need to apply
            </h3>
            <ul className="space-y-2 mb-4">
              {role.requirements.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-white/60">
                  <span className="material-symbols-outlined text-[18px] shrink-0 text-white/30">
                    description
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-xs text-white/35 mb-6">
              Our team reviews every application. If a document needs fixing,
              we&apos;ll flag just that one so you can resubmit it.
            </p>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Dialog.Close className="py-2.5 px-5 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors cursor-pointer">
                Not now
              </Dialog.Close>
              <Link
                href={role.href}
                className="py-2.5 px-5 rounded-xl text-sm font-bold text-black text-center transition-opacity hover:opacity-90"
                style={{ backgroundColor: role.color }}
              >
                Continue to application
              </Link>
            </div>
          </Dialog.Content>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}
