"use client";

import React, { useState } from "react";
import { useApplyRole } from "@/features/role-application/hooks/useApplyRole";
import { Building2, Phone, MapPin, Hash, AlignLeft, ArrowRight } from "lucide-react";
import RequireAuth from "@/features/auth/components/RequireAuth";
import Link from "next/link";
import FileUploader from "@/shared/components/layout/FileUploader";
import KycDocumentSection from "@/shared/components/layout/KycDocumentSection";

export default function MayorApplicationClient() {
  const { mutate: applyRole, isPending } = useApplyRole();

  const [formData, setFormData] = useState({
    businessName: "",
    contactNumber: "",
    address: "",
    tinNumber: "",
    description: "",
    validId1FileId: "",
    nbiFileId: "",
    tinIdFileId: "",
    birPermitFileId: "",
    selfieFileId: "",
  });

  const handleFileUpload = (field: string, fileId: string) => {
    setFormData(prev => ({ ...prev, [field]: fileId }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyRole({ roleType: "venueFoxer", data: formData });
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-4 pt-24 pb-12 font-body">
        <div className="w-full max-w-2xl bg-[#1a1a24] rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#ccff00]/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="mb-10 text-center relative z-10">
            <div className="w-16 h-16 bg-[#ccff00]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#ccff00]">
              <Building2 size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              Apply to be a <span className="text-[#ccff00]">Mayor</span>
            </h1>
            <p className="text-white/60">
              Provide your details below to start managing venues in FoxPassport ecosystem.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Business Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Business / Venue Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <Building2 size={18} />
                </div>
                <input
                  required
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/10 transition-colors"
                  placeholder="The Neon Lounge"
                />
              </div>
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Contact Number *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <Phone size={18} />
                </div>
                <input
                  required
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/10 transition-colors"
                  placeholder="+63 900 000 0000"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Complete Address *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <MapPin size={18} />
                </div>
                <input
                  required
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/10 transition-colors"
                  placeholder="123 Makati Ave, Metro Manila"
                />
              </div>
            </div>

            {/* TIN Number */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/80 uppercase tracking-wider">TIN Number *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <Hash size={18} />
                </div>
                <input
                  required
                  type="text"
                  name="tinNumber"
                  value={formData.tinNumber}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/10 transition-colors"
                  placeholder="000-000-000-000"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Description (Optional)</label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none text-white/40">
                  <AlignLeft size={18} />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/10 transition-colors resize-none"
                  placeholder="Tell us a bit about your spaces and what makes them unique..."
                />
              </div>
            </div>

            <KycDocumentSection onUpload={handleFileUpload} />

            {/* Actions */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 items-center">
              <Link 
                href="/onboarding" 
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-center font-medium"
              >
                Back
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex-1 flex items-center justify-center gap-2 bg-[#ccff00] text-black font-bold py-3 px-6 rounded-xl hover:brightness-110 hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Submitting..." : "Submit Application"}
                {!isPending && <ArrowRight size={18} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RequireAuth>
  );
}
