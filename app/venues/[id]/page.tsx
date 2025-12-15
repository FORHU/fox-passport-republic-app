"use client";

import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import { Star, MapPin, CheckCircle, ArrowLeft, Utensils, Camera, Map } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useVenueDetails } from "@/src/hooks/useVenueDetails"; // Import your new hook
import ReviewSnippet from "@/src/components/ReviewSnippet";   // Import your review component

export default function VenueDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const id = params.id as string; 
  
  // --- UPDATED: Use the custom hook to get Venue, Activities, and Reviews ---
  const details = useVenueDetails(id);
  const venue = details?.venue;
  const activities = details?.activities || [];
  const reviews = details?.reviews || [];

  // 2. Extract Search Parameters for the Booking Card
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");
  const guestsParam = searchParams.get("guests");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");

  // Format dates for display
  const formatDate = (isoString: string | null) => {
    if (!isoString) return "Add date";
    return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const checkInDisplay = formatDate(checkInParam);
  const checkOutDisplay = formatDate(checkOutParam);
  
  // Calculate nights/price if dates exist
  const [nights, setNights] = useState(0);

  useEffect(() => {
    if (checkInParam && checkOutParam && venue) {
      const start = new Date(checkInParam);
      const end = new Date(checkOutParam);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      setNights(diffDays > 0 ? diffDays : 1); // Minimum 1 night
    }
  }, [checkInParam, checkOutParam, venue]);

  if (!venue) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Venue not found</h1>
            <p className="text-gray-500 mb-6">We couldn't find a venue with ID: <span className="font-mono text-black">{id}</span></p>
            <Link href="/" className="text-pink-600 hover:underline flex items-center justify-center gap-2 font-bold">
                <ArrowLeft size={16}/> Return Home
            </Link>
        </div>
    );
  }

  // Calculate costs
  const stayTotal = venue.price * (nights || 1);
  const serviceFee = 2500;
  const grandTotal = stayTotal + serviceFee;

  return (
    <main className="min-h-screen bg-white pb-20">
      <Navbar />
      
      {/* Main Container */}
      <div className="pt-24 md:pt-32 max-w-6xl mx-auto px-4 md:px-6">
        
        {/* HEADER */}
        <div className="mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">{venue.title}</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                <div className="flex items-center gap-1 font-semibold">
                    <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-black text-black" />
                    <span>{venue.rating}</span>
                    <span className="font-normal underline cursor-pointer">({venue.reviews} reviews)</span>
                </div>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1 font-semibold underline cursor-pointer">
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    {venue.location}, {venue.province}
                </span>
            </div>
        </div>

        {/* IMAGE HERO */}
        <div className="w-full h-[250px] md:h-[500px] rounded-xl md:rounded-2xl overflow-hidden bg-gray-200 mb-8 md:mb-10 relative group shadow-sm">
            <img src={venue.images[0]} className="w-full h-full object-cover" alt={venue.title} />
            <button className="absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-white/90 backdrop-blur px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-bold border border-gray-200 shadow-sm hover:bg-white transition">
                Show all photos
            </button>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_370px] gap-8 md:gap-12 relative">
            
            {/* LEFT COLUMN: Info */}
            <div className="order-2 md:order-1">
                <div className="border-b border-gray-200 pb-6 mb-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Entire {venue.category.toLowerCase()} hosted by {venue.host}</h2>
                    <p className="text-gray-500 text-sm">
                        {guestsParam || 2} guests • 1 bedroom • 1 bath
                        {startTime && endTime && ` • Event Time: ${startTime} - ${endTime}`}
                    </p>
                </div>

                <div className="border-b border-gray-200 pb-6 mb-6">
                    <h3 className="font-bold text-lg mb-4">What this place offers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {venue.offers.map((offer) => (
                            <div key={offer} className="flex items-center gap-3 text-gray-700 text-sm md:text-base">
                                <CheckCircle className="w-5 h-5 text-gray-400" />
                                <span>{offer}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-lg mb-3">About this venue</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                        {venue.description}
                    </p>
                </div>
            </div>

            {/* RIGHT COLUMN: Booking Card + Things To Do */}
            <div className="relative order-1 md:order-2">
                <div className="sticky top-28 space-y-6">
                    
                    {/* 1. BOOKING CARD */}
                    <div className="border border-gray-200 shadow-xl rounded-xl p-6 bg-white">
                        <div className="flex justify-between items-end mb-5">
                            <div>
                                <span className="text-xl md:text-2xl font-bold">₱{venue.price.toLocaleString()}</span>
                                <span className="text-gray-500 text-sm"> / night</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                                 <Star className="w-3 h-3 fill-black text-black" />
                                 <span>{venue.rating}</span>
                            </div>
                        </div>

                        {/* Booking Inputs */}
                        <div className="border border-gray-400 rounded-lg overflow-hidden mb-4">
                            <div className="flex border-b border-gray-400">
                                <div className="flex-1 p-3 border-r border-gray-400 bg-white">
                                    <label className="block text-[10px] font-bold uppercase text-gray-700">Check-in</label>
                                    <div className="text-xs md:text-sm text-gray-900 font-medium truncate">{checkInDisplay}</div>
                                </div>
                                <div className="flex-1 p-3 bg-white">
                                    <label className="block text-[10px] font-bold uppercase text-gray-700">Check-out</label>
                                    <div className="text-xs md:text-sm text-gray-900 font-medium truncate">{checkOutDisplay}</div>
                                </div>
                            </div>
                            <div className="p-3 bg-white">
                                 <label className="block text-[10px] font-bold uppercase text-gray-700">Guests</label>
                                 <div className="text-xs md:text-sm text-gray-900 font-medium">
                                     {guestsParam ? `${guestsParam} guests` : "Add guests"}
                                 </div>
                            </div>
                        </div>

                        <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 rounded-lg transition-colors mb-4 shadow-md">
                            Reserve
                        </button>

                        <p className="text-center text-xs text-gray-500 mb-6">You won't be charged yet</p>
                        
                        {checkInParam && checkOutParam ? (
                            <>
                                <div className="flex justify-between text-gray-600 text-sm mb-2">
                                    <span className="underline">₱{venue.price.toLocaleString()} x {nights} nights</span>
                                    <span>₱{stayTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm mb-4">
                                    <span className="underline">FoxPassport Service Fee</span>
                                    <span>₱{serviceFee.toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-200 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>₱{grandTotal.toLocaleString()}</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-xs text-gray-500 italic">
                                Select dates to see total price.
                            </div>
                        )}
                    </div>

                    {/* 2. THINGS TO DO (Hardcoded Data from Hook) */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Map className="w-4 h-4" /> Things to do nearby
                        </h3>
                        <ul className="space-y-3">
                            {activities.map((activity, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                                    <div className="mt-0.5 min-w-[16px]">
                                        {/* Simple icon logic just for visual variety */}
                                        {idx % 2 === 0 ? <Camera className="w-4 h-4 text-blue-500"/> : <Utensils className="w-4 h-4 text-orange-500"/>}
                                    </div>
                                    <span>{activity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </div>

        {/* REVIEWS SECTION (Bottom) */}
        <div className="mt-12 md:mt-16 pt-10 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Star className="w-6 h-6 fill-black" /> 
                {venue.rating} · {venue.reviews} Reviews
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                        {/* We use your ReviewSnippet but slightly styled for the full page view */}
                        <ReviewSnippet user={review.user} content={review.content} />
                    </div>
                ))}
            </div>
            
            <div className="mt-8">
                 <button className="border border-black font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition">
                     Show all {venue.reviews} reviews
                 </button>
            </div>
        </div>

      </div>
    </main>
  );
}