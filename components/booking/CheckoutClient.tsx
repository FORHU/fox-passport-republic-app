"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCheckoutStore, Attendee } from "@/store/useCheckoutStore";
import { 
  createCheckoutEventContext, 
  draftBooking, 
  appendAttendees, 
  confirmBookingPaymentMock 
} from "@/lib/api/bookings";
import { ChevronLeft, Lock, ArrowRight, CheckCircle, CreditCard, Users, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function CheckoutClient() {
  const router = useRouter();
  const store = useCheckoutStore();
  const [isLoading, setIsLoading] = useState(false);

  // Fallback if accessed without store state
  useEffect(() => {
    if (!store.venueId) {
      toast.error("No booking selected. Redirecting to home.", { style: { background: "#0f111a", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }});
      router.push("/");
    }
  }, [store.venueId, router]);

  if (!store.venueId) return <div className="min-h-screen bg-background" />;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val);

  // Handlers
  const handleNextStep1 = async () => {
    try {
      setIsLoading(true);
      // OPTION B: Auto-Draft an Event
      const draftEvent = await createCheckoutEventContext({
        venueId: store.venueId!,
        name: `Private Reservation: ${store.venueName}`,
        totalPrice: store.totalAmount,
        guestCount: store.guestCount,
      });

      // Pass the eventId to Booking draft
      const draftBook = await draftBooking({
        eventId: draftEvent.id,
        guestCount: store.guestCount,
        totalAmount: store.totalAmount,
      });

      store.setDraftIds(draftEvent.id, draftBook.id);
      store.setStep(2);
      toast.success("Dates secured. Please enter guest details.", { style: { background: "#0f111a", color: "#ccff00" }});
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to secure dates. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep2 = async () => {
    try {
      // Validate attendees
      const isValid = store.attendees.every(a => a.firstName && a.lastName && a.email);
      if (!isValid) return toast.error("Please fill all required guest fields.");

      setIsLoading(true);
      if (!store.draftBookingId) throw new Error("Missing draft booking ID");

      await appendAttendees(store.draftBookingId, store.attendees);
      store.setStep(3);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to save guests.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep3 = async () => {
    try {
      setIsLoading(true);
      if (!store.draftBookingId) throw new Error("Missing draft booking ID");

      await confirmBookingPaymentMock(store.draftBookingId, store.totalAmount);
      
      toast.success("Payment successful! Your reservation is confirmed.", {
        style: { background: "#0f111a", color: "#ccff00", border: "1px solid #ccff00" },
        iconTheme: { primary: "#ccff00", secondary: "#000" }
      });
      
      // Navigate to some success page or dashboard
      router.push("/dashboard/bookings");
    } catch (error: any) {
      console.error(error);
      toast.error("Payment failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Premium Background Elements */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Modern Compact Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => store.step > 1 ? store.setStep((store.step - 1) as any) : router.back()}
          className="flex items-center gap-2 text-text-muted hover:text-white transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          {store.step > 1 ? "Back" : "Return to Venue"}
        </button>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold tracking-wider text-white uppercase">Secure Checkout</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 flex-grow flex flex-col lg:flex-row gap-8 lg:gap-16">
        
        {/* Left Column: Interactive Wizard Steps */}
        <div className="flex-1 w-full flex flex-col max-w-2xl">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500
                  ${store.step === s ? 'bg-accent text-black scale-110 shadow-[0_0_20px_rgba(204,255,0,0.4)]' : 
                    store.step > s ? 'bg-white/10 text-white' : 'bg-white/5 text-text-muted'}`}>
                  {store.step > s ? <CheckCircle className="w-5 h-5 text-accent" /> : s}
                </div>
                {s !== 3 && (
                  <div className={`flex-1 h-px mx-4 transition-all duration-500 ${store.step > s ? 'bg-accent/50' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Review Selection */}
          <div className={`transition-all duration-500 origin-top ${store.step === 1 ? 'opacity-100 translate-y-0 relative' : 'opacity-0 -translate-y-8 absolute pointer-events-none'}`}>
            <h1 className="text-4xl font-light mb-8">Review <span className="font-semibold text-white">Selection</span></h1>
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-text-muted flex items-center gap-2"><Calendar className="w-4 h-4"/> Check-in</p>
                  <p className="text-lg font-medium">Auto-Mapped Date</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-text-muted flex items-center gap-2"><Users className="w-4 h-4"/> Guests</p>
                  <p className="text-lg font-medium">{store.guestCount} Guest(s)</p>
                </div>
              </div>

              <div className="h-px w-full bg-white/10" />
              <button 
                onClick={handleNextStep1}
                disabled={isLoading}
                className="btn-neon w-full py-4 rounded-full text-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? "Securing Timeslot..." : "Confirm Dates"}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Step 2: Attendees */}
          <div className={`transition-all duration-500 origin-top ${store.step === 2 ? 'opacity-100 translate-y-0 relative' : 'opacity-0 -translate-y-8 absolute pointer-events-none'}`}>
            <h1 className="text-4xl font-light mb-8">Guest <span className="font-semibold text-white">Details</span></h1>
            <div className="space-y-6">
              {store.attendees.map((attendee, index) => (
                <div key={index} className="glass-card p-6 rounded-3xl space-y-6 relative overflow-hidden">
                  <h3 className="text-sm font-semibold tracking-wider text-accent uppercase mb-2">Guest {index + 1} Profile</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-text-muted ml-2 uppercase tracking-wide">First Name</label>
                      <input 
                        type="text"
                        value={attendee.firstName}
                        onChange={(e) => {
                          const arr = [...store.attendees];
                          arr[index].firstName = e.target.value;
                          store.setAttendees(arr);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                        placeholder="Fox"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-text-muted ml-2 uppercase tracking-wide">Last Name</label>
                      <input 
                        type="text"
                        value={attendee.lastName}
                        onChange={(e) => {
                          const arr = [...store.attendees];
                          arr[index].lastName = e.target.value;
                          store.setAttendees(arr);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                        placeholder="Passport"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs text-text-muted ml-2 uppercase tracking-wide">Email</label>
                      <input 
                        type="email"
                        value={attendee.email}
                        onChange={(e) => {
                          const arr = [...store.attendees];
                          arr[index].email = e.target.value;
                          store.setAttendees(arr);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                        placeholder="fox@republic.com"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={handleNextStep2}
                disabled={isLoading}
                className="btn-neon w-full py-4 rounded-full text-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? "Saving..." : "Continue to Payment"}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Step 3: Payment (Mocked Stripe UI) */}
          <div className={`transition-all duration-500 origin-top ${store.step === 3 ? 'opacity-100 translate-y-0 relative' : 'opacity-0 -translate-y-8 absolute pointer-events-none'}`}>
            <h1 className="text-4xl font-light mb-8">Secure <span className="font-semibold text-white">Payment</span></h1>
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-white/10 shadow-2xl relative overflow-hidden">
               {/* Decorative Stripe Gradient */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-accent" />
               
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-accent" />
                    <span className="font-semibold text-white tracking-wide">Card Details</span>
                  </div>
                  <div className="flex gap-2">
                     <div className="w-8 h-5 bg-white/10 rounded" />
                     <div className="w-8 h-5 bg-white/10 rounded" />
                  </div>
               </div>

               <div className="space-y-4">
                 <div className="w-full h-12 bg-white/5 border border-white/10 rounded-xl flex items-center px-4 animate-pulse">
                    <span className="text-white/30 font-mono text-sm tracking-[0.2em] select-none">•••• •••• •••• ••••</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="w-full h-12 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
                    <div className="w-full h-12 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
                 </div>
                 <div className="text-center pt-2">
                   <span className="text-xs text-text-muted mt-2">Powered securely by <strong>Stripe</strong>. Environment: Frontend Mock.</span>
                 </div>
               </div>

               <button 
                onClick={handleNextStep3}
                disabled={isLoading}
                className="w-full py-4 text-black bg-accent hover:bg-accent/90 focus:ring-4 focus:ring-accent/30 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)] shadow-glow mt-8 text-lg"
              >
                {isLoading ? "Processing..." : `Pay ${formatCurrency(store.totalAmount)}`}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary Glass Card */}
        <div className="w-full lg:w-[400px]">
          <div className="glass-card rounded-3xl p-6 sm:p-8 sticky top-24 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 tracking-tight line-clamp-2 leading-tight">
                {store.venueName}
              </h2>
              <div className="h-px bg-white/10 w-full mb-6" />
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-text-muted">Total Nights</span>
                   <span className="text-white font-medium">{store.nights}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-text-muted">Service Fee</span>
                   <span className="text-white font-medium">{formatCurrency(0)}</span>
                </div>
              </div>

              <div className="h-px bg-white/10 w-full mb-6" />

              <div className="flex justify-between items-end">
                 <span className="text-white font-medium">Total Amount</span>
                 <span className="text-accent text-3xl font-bold tracking-tight">{formatCurrency(store.totalAmount)}</span>
              </div>
          </div>
        </div>

      </main>
    </div>
  );
}
