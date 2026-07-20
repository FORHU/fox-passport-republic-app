"use client";

import React, { useState } from "react";
import { useApplyRole } from "@/features/role-application/hooks/useApplyRole";
import { Globe, ArrowRight, ShieldCheck, MapPin } from "lucide-react";
import RequireAuth from "@/features/auth/components/RequireAuth";
import Link from "next/link";
import FileUploader from "@/shared/components/layout/FileUploader";
import KycDocumentSection from "@/shared/components/layout/KycDocumentSection";
import SpecializationPicker from "./SpecializationPicker";

const EVENT_CATEGORY_OPTIONS = [
  { value: "corporate", label: "Corporate" },
  { value: "birthday", label: "Birthday" },
  { value: "wedding", label: "Wedding" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];

export default function HostApplicationClient() {
  const { mutate: applyRole, isPending } = useApplyRole();
  const [formData, setFormData] = useState({
    bio: "",
    experience: "",
    location: "",
    validId1FileId: "",
    nbiFileId: "",
    tinIdFileId: "",
    birPermitFileId: "",
    selfieFileId: "",
    portfolioFileId: "",
  });
  const [specializations, setSpecializations] = useState<string[]>([]);

  const handleFileUpload = (field: string, fileId: string) => {
    setFormData(prev => ({ ...prev, [field]: fileId }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyRole({
      roleType: "eventFoxer",
      data: {
        ...formData,
        specializations,
      },
    });
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#0f111a] flex flex-col items-center justify-center p-4 pt-24 pb-12 font-body">
        <div className="w-full max-w-2xl bg-[#1a1a24] rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#ff00aa]/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="mb-10 text-center relative z-10">
            <div className="w-16 h-16 bg-[#ff00aa]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#ff00aa]">
              <Globe size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              Become an <span className="text-[#ff00aa]">Event Foxer</span>
            </h1>
            <p className="text-white/60">
              Apply to become an authorized Event Creator. Organizers use venues provided by Mayors to create unforgettable experiences.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Bio / Experience *</label>
              <textarea
                required
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff00aa]/50 focus:bg-white/10 transition-colors resize-none"
                placeholder="Tell us about your background in event organizing..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Base Location *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                    <MapPin size={18} />
                  </div>
                  <input
                    required
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff00aa]/50 focus:bg-white/10 transition-colors"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Years of Experience</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                    <ShieldCheck size={18} />
                  </div>
                  <input
                    type="number"
                    min="0"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff00aa]/50 focus:bg-white/10 transition-colors"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>
            </div>

            <SpecializationPicker
              options={EVENT_CATEGORY_OPTIONS}
              value={specializations}
              onChange={setSpecializations}
              accentColor="#ff00aa"
            />

            <KycDocumentSection onUpload={handleFileUpload} />

            <FileUploader
              label="Portfolio / Resume (Optional)" 
              onUploadComplete={(id) => handleFileUpload("portfolioFileId", id)} 
            />

            <div className="p-4 bg-[#ff00aa]/10 border border-[#ff00aa]/20 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="text-[#ff00aa] shrink-0 mt-0.5" size={20} />
              <p className="text-xs text-[#ff00aa]/80 leading-relaxed">
                By submitting this application, you agree to comply with FoxPassport&apos;s event hosting policies and quality standards. Your application will be reviewed by our team.
              </p>
            </div>

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
                className="w-full flex-1 flex items-center justify-center gap-2 bg-[#ff00aa] text-white font-bold py-3 px-6 rounded-xl hover:brightness-110 hover:shadow-[0_0_20px_rgba(255,0,170,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
