import React, { useEffect, useState } from "react";
import { submitBid } from "@/shared/api/bidding";
import { toast } from "sonner";

interface BidApplicationModalProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  services: any[]; // The Talent Foxer's own services
}

export const BidApplicationModal: React.FC<BidApplicationModalProps> = ({ eventId, isOpen, onClose, onSuccess, services }) => {
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || "");
  const [proposedPrice, setProposedPrice] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedServiceId || !proposedPrice) {
      toast.error("Please select a service and enter a price");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitBid({
        eventId,
        proposedServiceId: selectedServiceId,
        proposedPrice: Number(proposedPrice),
        message,
      });
      toast.success("Your application has been submitted!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto" role="dialog">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="glass-card relative rounded-2xl border border-white/10 p-6 w-full max-w-md z-10 animate-in fade-in zoom-in-95">
        <h2 className="text-xl font-bold mb-4">Apply for Event Slot</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Which of your services are you offering?</label>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#ccff00] focus:outline-none transition-colors"
              value={selectedServiceId} 
              onChange={(e) => setSelectedServiceId(e.target.value)}
            >
              <option value="" disabled className="text-black">Select a service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id} className="text-black">{s.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Proposed Price (PHP)</label>
            <input 
              type="number" 
              placeholder="e.g. 5000" 
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#ccff00] focus:outline-none transition-colors"
              value={proposedPrice} 
              onChange={(e) => setProposedPrice(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Message (Optional)</label>
            <textarea 
              placeholder="Why are you a good fit?" 
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white min-h-[100px] focus:border-[#ccff00] focus:outline-none transition-colors"
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white/70">Cancel</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 rounded-full bg-[#ccff00] text-black font-semibold hover:bg-[#ccff00]/90 transition-colors">Submit Application</button>
        </div>
      </div>
    </div>
  );
};
