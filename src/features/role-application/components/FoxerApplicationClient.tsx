"use client";

import React, { useState } from "react";
import { useApplyRole } from "@/features/role-application/hooks/useApplyRole";
import { Briefcase, Package, Tag, Hash, ArrowRight, UserCircle, Link as LinkIcon, BadgeCheck } from "lucide-react";
import RequireAuth from "@/features/auth/components/RequireAuth";
import Link from "next/link";
import FileUploader from "@/shared/components/layout/FileUploader";
import KycDocumentSection from "@/shared/components/layout/KycDocumentSection";

export default function FoxerApplicationClient({ initialType = "service" }: { initialType?: "asset" | "service" }) {
  const { mutate: applyRole, isPending } = useApplyRole();
  const [providerType, setProviderType] = useState<"asset" | "service">(initialType);

  // Asset Form State
  const [assetData, setAssetData] = useState({
    businessName: "",
    assetTypes: "",
    tinNumber: "",
    validId1FileId: "",
    nbiFileId: "",
    tinIdFileId: "",
    birPermitFileId: "",
    selfieFileId: "",
  });

  // Service Form State
  const [serviceData, setServiceData] = useState({
    serviceTypes: "",
    portfolioUrls: "",
    experience: "",
    nbiClearanceIdNumber: "",
    tinNumber: "",
    validId1FileId: "",
    nbiFileId: "",
    tinIdFileId: "",
    birPermitFileId: "",
    selfieFileId: "",
  });

  const handleFileUpload = (field: string, fileId: string) => {
    if (providerType === "asset") {
      setAssetData(prev => ({ ...prev, [field]: fileId }));
    } else {
      setServiceData(prev => ({ ...prev, [field]: fileId }));
    }
  };

  const handleAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssetData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServiceData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (providerType === "asset") {
      applyRole({
        roleType: "gearFoxer",
        data: {
          ...assetData,
          assetTypes: assetData.assetTypes.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
    } else {
      applyRole({
        roleType: "serviceFoxer",
        data: {
          ...serviceData,
          experience: parseInt(serviceData.experience, 10),
          serviceTypes: serviceData.serviceTypes.split(",").map((s) => s.trim()).filter(Boolean),
          portfolioUrls: serviceData.portfolioUrls.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#0f111a] flex flex-col items-center justify-center p-4 pt-24 pb-12 font-body">
        <div className="w-full max-w-2xl bg-[#1a1a24] rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div
            className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 blur-[100px] rounded-full pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: providerType === 'asset' ? 'rgba(167,139,250,0.1)' : 'rgba(0,210,255,0.1)' }}
          />

          <div className="mb-10 text-center relative z-10">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300"
              style={{
                backgroundColor: providerType === 'asset' ? 'rgba(167,139,250,0.2)' : 'rgba(0,210,255,0.2)',
                color: providerType === 'asset' ? '#a78bfa' : '#00d2ff',
              }}
            >
              {providerType === 'asset' ? <Package size={32} /> : <Briefcase size={32} />}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              Apply to be a <span style={{ color: providerType === 'asset' ? '#a78bfa' : '#00d2ff' }}>Foxer</span>
            </h1>
            <p className="text-white/60">
              Provide your professional details to start offering services or equipment in FoxPassport.
            </p>
          </div>

          {/* Provider Type Toggle */}
          <div className="flex bg-white/5 p-1 rounded-xl mb-8 relative z-10">
            <button
              onClick={() => setProviderType("service")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                providerType === "service" ? "bg-[#00d2ff] text-black shadow-lg" : "text-white/50 hover:text-white"
              }`}
            >
              Service Provider
            </button>
            <button
              onClick={() => setProviderType("asset")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                providerType === "asset" ? "bg-[#a78bfa] text-black shadow-lg" : "text-white/50 hover:text-white"
              }`}
            >
              Gear Provider
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {providerType === "service" ? (
              // --- SERVICE PROVIDER FORM ---
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Service Types *</label>
                  <p className="text-xs text-white/40 mb-1">Comma-separated (e.g. Photography, DJ, Catering)</p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <Tag size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="serviceTypes"
                      value={serviceData.serviceTypes}
                      onChange={handleServiceChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="Photography, Event Styling, DJ..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Years of Experience *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <UserCircle size={18} />
                    </div>
                    <input
                      required
                      type="number"
                      min="0"
                      name="experience"
                      value={serviceData.experience}
                      onChange={handleServiceChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Portfolio Links *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <LinkIcon size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="portfolioUrls"
                      value={serviceData.portfolioUrls}
                      onChange={handleServiceChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="https://instagram.com/..., https://myportfolio.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">NBI Clearance ID *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <BadgeCheck size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="nbiClearanceIdNumber"
                      value={serviceData.nbiClearanceIdNumber}
                      onChange={handleServiceChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="XXXX-XXXX-XXXX"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">TIN Number (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <Hash size={18} />
                    </div>
                    <input
                      type="text"
                      name="tinNumber"
                      value={serviceData.tinNumber}
                      onChange={handleServiceChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="000-000-000-000"
                    />
                  </div>
                </div>

                <KycDocumentSection 
                  onUpload={handleFileUpload} 
                  title="Professional Verification"
                  description="As a service provider, we require a full background check including NBI clearance."
                />
              </>
            ) : (
              // --- ASSET PROVIDER FORM ---
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Business Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <Briefcase size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="businessName"
                      value={assetData.businessName}
                      onChange={handleAssetChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="Super Sounds Audio"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Equipment Types *</label>
                  <p className="text-xs text-white/40 mb-1">Comma-separated (e.g. Speakers, Microphones, Lights)</p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <Package size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="assetTypes"
                      value={assetData.assetTypes}
                      onChange={handleAssetChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="Sound Systems, Lighting Rigs..."
                    />
                  </div>
                </div>

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
                      value={assetData.tinNumber}
                      onChange={handleAssetChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="000-000-000-000"
                    />
                  </div>
                </div>

                <KycDocumentSection 
                  onUpload={handleFileUpload} 
                  title="Equipment Provider Verification"
                  description="Verify your identity to start listing assets on FoxPassport."
                />
              </>
            )}

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
                className="w-full flex-1 flex items-center justify-center gap-2 text-black font-bold py-3 px-6 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: providerType === 'asset' ? '#a78bfa' : '#00d2ff' }}
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
