"use client";

import React from "react";
import Navbar from "@/src/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { 
  Star, MapPin, Share, Heart, CheckCircle, 
  Wifi, Car, Utensils, Monitor, Wind, 
  Tv, Waves, Coffee, Medal, ShieldCheck,
  Camera, ShoppingBag, X, ChevronLeft, ChevronRight, ChevronDown
} from "lucide-react";
import DatePicker from "@/src/components/DatePicker";
import { useVenuePage } from "@/src/hooks/useVenuePage"; 

// --- Helper Components ---
const getAmenityIcon = (offer: string) => {
  const lower = offer.toLowerCase();
  if (lower.includes("wifi")) return <Wifi className="w-6 h-6" />;
  if (lower.includes("parking")) return <Car className="w-6 h-6" />;
  if (lower.includes("kitchen")) return <Utensils className="w-6 h-6" />;
  if (lower.includes("tv")) return <Tv className="w-6 h-6" />;
  if (lower.includes("work")) return <Monitor className="w-6 h-6" />;
  if (lower.includes("ac") || lower.includes("air")) return <Wind className="w-6 h-6" />;
  if (lower.includes("pool")) return <Waves className="w-6 h-6" />;
  if (lower.includes("coffee")) return <Coffee className="w-6 h-6" />;
  return <CheckCircle className="w-6 h-6" />; 
};

const getActivityIcon = (index: number) => {
    if (index % 2 === 0) return <Camera className="w-5 h-5 text-gray-700" />;
    return <ShoppingBag className="w-5 h-5 text-gray-700" />;
};

export default function VenueDetailsPage() {
  // The hook now automatically grabs params.id
  const { venue, booking, gallery, details, loading } = useVenuePage();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center animate-pulse">Loading venue...</div>;
  }

  if (!venue) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Venue not found</h1>
            <Link href="/" className="text-blue-600 underline">Go back home</Link>
        </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />
      
      {/* --- DIALOG/LIGHTBOX GALLERY MODAL --- */}
      {gallery.isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200 h-screen max-h-screen overflow-hidden">
          
          {/* Top Bar - Title & Close */}
          <div className="flex justify-between items-center px-6 py-4 bg-black/50 text-white shrink-0 z-20 absolute top-0 left-0 right-0 border-b border-white/10">
            <div className="flex flex-col">
               <h3 className="font-bold text-lg">{venue.title}</h3>
               <p className="text-sm text-gray-400">{gallery.richData[gallery.index].caption}</p>
            </div>

            <div className="flex items-center gap-4">
                 <button className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition text-sm font-semibold">
                    <Share className="w-4 h-4" /> Share
                 </button>
                 <button className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition text-sm font-semibold">
                    <Heart className="w-4 h-4" /> Save
                 </button>
                 <div className="h-6 w-px bg-white/20 mx-2"></div>
                <button 
                  onClick={gallery.close}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  <X className="w-6 h-6" /> 
                </button>
            </div>
          </div>

          {/* Main Content - Centered Image */}
          <div className="flex-1 relative flex items-center justify-center p-4 md:p-10 overflow-hidden group">
              <Image 
                src={gallery.richData[gallery.index].src} 
                alt={`Gallery ${gallery.index + 1}`} 
                fill
                className="object-contain shadow-2xl transition-transform duration-300 max-h-[80vh]"
                quality={100}
              />
              
              {/* Nav Buttons */}
              <button 
                onClick={gallery.prev} 
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-all opacity-0 group-hover:opacity-100 md:opacity-100 backdrop-blur-md"
              >
                  <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={gallery.next} 
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-all opacity-0 group-hover:opacity-100 md:opacity-100 backdrop-blur-md"
              >
                  <ChevronRight className="w-6 h-6" />
              </button>
          </div>

          {/* Bottom Bar - Thumbnails (Filmstrip) */}
          <div className="h-24 bg-black/80 border-t border-white/10 shrink-0 flex items-center justify-center relative overflow-x-auto overflow-y-hidden px-4">
             <div className="flex gap-2">
                {gallery.richData.map((img, idx) => (
                   <button 
                     key={idx} 
                     onClick={() => gallery.open(idx)}
                     className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all shrink-0 ${idx === gallery.index ? 'border-[#E0073B] opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-80'}`}
                   >
                      <Image src={img.src} fill className="object-cover" alt={`Thumb ${idx}`} />
                   </button>
                ))}
             </div>
             
             <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
               {gallery.index + 1} of {gallery.richData.length}
             </div>
          </div>
        </div>
      )}

      <div className="pt-24 md:pt-28 max-w-6xl mx-auto px-4 md:px-6">
        
        {/* --- HEADER --- */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{venue.title}</h1>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-medium underline cursor-pointer text-gray-900">
              <Star className="w-4 h-4 fill-black" />
              <span>{venue.rating}</span>
              <span className="text-gray-900">·</span>
              <span>{venue.reviews} reviews</span>
              <span className="text-gray-900">·</span>
              <span className="text-gray-600 font-normal no-underline flex items-center gap-1">
                 {venue.location}, {venue.province}
              </span>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 text-sm font-bold border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-md shadow-sm transition">
                <Star className="w-4 h-4 fill-none text-gray-600" /> <span className="text-gray-700">Write a Review</span>
              </button>
              <button className="flex items-center gap-2 text-sm font-bold border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-md shadow-sm transition">
                <Camera className="w-4 h-4 text-gray-600" /> <span className="text-gray-700">Add Photo</span>
              </button>
              <button className="flex items-center gap-2 text-sm font-bold border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-md shadow-sm transition">
                <Share className="w-4 h-4 text-gray-600" /> <span className="text-gray-700">Share</span>
              </button>
              <button className="flex items-center gap-2 text-sm font-bold border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-md shadow-sm transition">
                <Heart className="w-4 h-4 text-gray-600" /> <span className="text-gray-700">Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- IMAGE GRID --- */}
        {/* --- IMAGE GRID (Yelp Style - tighter gap, less rounding) --- */}
        <div className="relative rounded-md overflow-hidden grid grid-cols-4 grid-rows-2 gap-1 h-[300px] md:h-[450px] mb-8 md:mb-12">
          {/* Main Image */}
          <div className="col-span-2 row-span-2 relative group cursor-pointer" onClick={() => gallery.open(0)}>
            <Image src={gallery.images[0]} fill className="object-cover hover:brightness-90 transition duration-300" alt="Main" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />
          </div>
          {/* Sub Images */}
          {gallery.images.slice(1, 5).map((img, idx) => (
            <div key={idx} className="col-span-1 row-span-1 relative group cursor-pointer" onClick={() => gallery.open(idx + 1)}>
              <Image src={img} fill className="object-cover hover:brightness-90 transition duration-300" alt={`Sub ${idx}`} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />
            </div>
          ))}
          <button onClick={() => gallery.open(0)} className="absolute bottom-5 right-5 bg-white border border-gray-400 px-4 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-gray-100 transition flex items-center gap-2 z-10 text-gray-800">
            <Camera className="w-4 h-4" />
            See all {gallery.images.length} photos
          </button>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr] gap-12 relative">
          
          {/* Left Column - Card Style for Yelp Look */}
          <div className="space-y-6">
            
            {/* Host Section Card */}
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
               <div className="flex justify-between items-center mb-4">
                 <div>
                   <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Entire {venue.category} hosted by {details.host.name}</h2>
                   <p className="text-gray-600 text-sm md:text-base">{venue.guestCount} guests · {venue.bedroomCount} bedroom · {venue.bathroomCount} bath</p>
                 </div>
                 <Image src={details.host.avatar} width={56} height={56} alt={details.host.name} className="w-14 h-14 rounded-full object-cover border border-gray-200" />
               </div>
               
               {/* Highlights inside Host Card */}
               <div className="border-t border-gray-100 pt-6 space-y-4">
                 <div className="flex gap-4">
                   <Medal className="w-6 h-6 text-[#E0073B] shrink-0" />
                   <div><h3 className="font-bold text-gray-900">Superhost</h3><p className="text-gray-500 text-sm">Experienced, highly rated host.</p></div>
                 </div>
                 <div className="flex gap-4">
                   <MapPin className="w-6 h-6 text-[#E0073B] shrink-0" />
                   <div><h3 className="font-bold text-gray-900">Great location</h3><p className="text-gray-500 text-sm">95% of guests gave a 5-star rating.</p></div>
                 </div>
               </div>
            </div>

            {/* Description Card */}
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
               <h3 className="font-bold text-lg mb-4 text-gray-900">About this place</h3>
               <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{venue.description}</p>
               <button className="mt-4 font-bold text-[#E0073B] hover:underline flex items-center gap-1">Show more ›</button>
            </div>

            {/* Sleeping Card */}
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
               <h3 className="font-bold text-xl mb-4 text-gray-900">Where you&apos;ll sleep</h3>
               <div className="border border-gray-200 rounded-lg p-6 w-full md:w-1/2 bg-gray-50">
                  <div className="mb-4 text-2xl">🛏️</div>
                  <div className="font-bold mb-1">Bedroom</div>
                  <div className="text-sm text-gray-500">1 queen bed</div>
               </div>
            </div>

            {/* Amenities Card */}
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
               <h3 className="font-bold text-xl mb-4 text-gray-900">What this place offers</h3>
               <div className="grid grid-cols-2 gap-4">
                 {venue.offers.map((offer, i) => (
                   <div key={i} className="flex items-center gap-3 text-gray-700">
                     {getAmenityIcon(offer)}<span className="font-medium text-sm">{offer}</span>
                   </div>
                 ))}
               </div>
               <button className="mt-6 border border-gray-900 text-gray-900 px-6 py-2 rounded-md font-bold text-sm hover:bg-gray-50 transition">
                  Show all amenities
               </button>
            </div>

            {/* Activities Card */}
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
              <h3 className="font-bold text-xl mb-4 text-gray-900">Things to do nearby</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {details.displayActivities.map((activity, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white hover:border-gray-300 hover:shadow-md transition cursor-pointer">
                          <div className="mt-1 bg-white p-2 rounded-full border border-gray-100 shadow-sm">{getActivityIcon(i)}</div>
                          <div><h4 className="font-bold text-gray-900 text-sm">{activity}</h4><p className="text-xs text-gray-500 mt-0.5">Recommended spot</p></div>
                      </div>
                  ))}
              </div>
            </div>

            {/* Calendar Card */}
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
              <h3 className="font-bold text-xl mb-1 text-gray-900">{booking.nights > 0 ? `${booking.nights} nights` : "Select dates"} in {venue.location}</h3>
              <p className="text-gray-500 text-sm mb-6">{booking.formatDate(booking.dateRange.start)} - {booking.formatDate(booking.dateRange.end)}</p>
              <div className="bg-gray-50 rounded-xl p-4 md:p-6 flex justify-center border border-gray-100">
                 <DatePicker inline onSelectDates={(start, end) => booking.setDateRange({ start, end })} onClose={() => {}} />
              </div>
            </div>
          </div>

          {/* Sticky Booking Card */}
          {/* Sticky Booking Card (Yelp Style) */}
          <div className="relative">
            <div className="sticky top-28 bg-white border border-gray-300 shadow-sm rounded-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Make a reservation</h3>
              
              <div className="border border-gray-300 rounded-md overflow-hidden mb-4">
                <div className="flex border-b border-gray-300 bg-white">
                  <div className="flex-1 p-3 border-r border-gray-300 hover:bg-gray-50 cursor-pointer">
                      <label className="block text-[10px] font-bold uppercase text-gray-600">Check-in</label>
                      <div className="text-sm text-gray-900 font-medium">{booking.formatDate(booking.dateRange.start)}</div>
                  </div>
                  <div className="flex-1 p-3 hover:bg-gray-50 cursor-pointer">
                      <label className="block text-[10px] font-bold uppercase text-gray-600">Check-out</label>
                      <div className="text-sm text-gray-900 font-medium">{booking.formatDate(booking.dateRange.end)}</div>
                  </div>
                </div>
                <div className="p-3 hover:bg-gray-50 cursor-pointer">
                    <label className="block text-[10px] font-bold uppercase text-gray-600">Guests</label>
                    <div className="text-sm text-gray-900 font-medium">{booking.guestsParam || 1} guest</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                 <div className="text-2xl font-bold text-gray-900">₱{venue.price.toLocaleString()}</div>
                 <div className="text-sm text-gray-500">per night</div>
              </div>

              <button className="w-full bg-[#E0073B] hover:bg-[#b0052e] text-white font-bold py-3 rounded-md transition-colors mb-4 shadow-sm text-base">
                Reserve
              </button>

              <div className="space-y-2 text-gray-600 text-sm">
                <div className="flex justify-between"><span>₱{venue.price.toLocaleString()} x {booking.nights} nights</span><span>₱{booking.stayTotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Service fee</span><span>₱{booking.serviceFee.toLocaleString()}</span></div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span>₱{booking.grandTotal.toLocaleString()}</span></div>
              </div>

              {/* Get Directions (Moved here) */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                      <MapPin className="w-5 h-5 text-gray-500"/>
                      <span className="font-bold text-gray-900 text-sm">{venue.location}, {venue.province}</span>
                  </div>
                   <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2 rounded-md text-sm transition-colors">
                      Get Directions
                   </button>
              </div>
            </div>
          </div>
        </div>

        {/* Location / Map Placeholder - Card Style */}
        <div className="mt-8 bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Where you&apos;ll be</h2>
            <div className="w-full h-[400px] bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center relative overflow-hidden group">
                {/* Placeholder Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="flex flex-col items-center gap-2 z-10">
                    <div className="bg-[#E0073B] text-white p-3 rounded-full shadow-lg transform group-hover:-translate-y-1 transition duration-300">
                        <MapPin className="w-8 h-8 fill-white" />
                    </div>
                    <span className="font-bold text-gray-900 bg-white/80 px-4 py-1 rounded-full backdrop-blur-sm shadow-sm">
                        {venue.location}, {venue.province}
                    </span>
                </div>
                
                <div className="absolute bottom-4 right-4 z-10">
                     <button className="bg-white text-gray-900 border border-gray-300 font-bold px-4 py-2 rounded-md shadow-sm text-sm hover:bg-gray-50 flex items-center gap-2">
                         Open in Google Maps
                     </button>
                </div>
            </div>
        </div>

        {/* Reviews */}
        {/* Reviews (Yelp Style - Single Column + Elite Badge look) */}
        {/* Reviews (Yelp Style - Card + Single Column) */}
        <div className="mt-8 bg-white p-6 rounded-md shadow-sm border border-gray-200">
           <h2 className="text-2xl font-bold mb-8 text-gray-900">Recommended Reviews</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12">
              <div className="space-y-8">
                 {/* Rating Summary */}
                 <div className="flex items-center gap-4 mb-8 bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-6 h-6 ${i < Math.floor(venue.rating) ? "fill-[#E0073B] text-[#E0073B]" : "fill-gray-300 text-gray-300"}`} />
                        ))}
                    </div>
                    <span className="font-bold text-lg text-gray-900">{venue.rating} rating</span>
                    <span className="text-gray-500 text-sm">({venue.reviews} reviews)</span>
                 </div>

                 {/* Review List */}
                 <div className="space-y-8">
                     <ReviewCard name="Sarah K." date="January 4, 2024" location="Manila, Philippines" comment="So cozy! The real fireplace was the highlight. Perfect for cold Baguio nights. The host was amazing and the place was spotless." images={[]} />
                     <ReviewCard name="Mike T." date=" December 12, 2023" location="Cebu City, Philippines" comment="Great location, very quiet. The host Benjie was extremely helpful with directions. Will definitely book again next time I'm in town!" images={[]} />
                 </div>
              </div>
              
              {/* Sidebar for Rating Bars (Yelp moves this to side or top usually, keeping it side for balance) */}
              <div className="hidden md:block">
                 <h4 className="font-bold text-gray-900 mb-4">Rating Breakdown</h4>
                 <div className="space-y-2">
                    <RatingBar label="Cleanliness" score={details.ratingCats.cleanliness} />
                    <RatingBar label="Accuracy" score={details.ratingCats.accuracy} />
                    <RatingBar label="Check-in" score={details.ratingCats.checkIn} />
                    <RatingBar label="Communication" score={details.ratingCats.communication} />
                    <RatingBar label="Location" score={details.ratingCats.location} />
                    <RatingBar label="Value" score={details.ratingCats.value} />
                 </div>
              </div>
           </div>
        </div>

        {/* Host (Bottom) */}
        <div className="py-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 leading-tight">Meet your Host</h2>
          <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-12 md:gap-24">
             {/* LEFT COLUMN - Host Card & Bio */}
             <div>
                {/* Host Card - Yelp Style: Boxy, Bordered, Shadow-sm */}
                <div className="bg-white rounded-md border border-gray-300 shadow-sm p-6 flex items-center justify-between mb-8">
                   {/* Avatar Side */}
                   <div className="flex flex-col items-center justify-center w-[40%] text-center">
                      <div className="relative w-24 h-24 mb-2">
                        <Image src={details.host.avatar} width={96} height={96} className="w-full h-full rounded-full object-cover border border-gray-200" alt="Host" />
                        {details.host.isSuperhost && <div className="absolute bottom-0 right-0 bg-[#E0073B] text-white rounded-full p-1 border-2 border-white"><Medal className="w-3 h-3" /></div>}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{details.host.name}</h3>
                      {details.host.isSuperhost && <div className="flex items-center gap-1 text-xs font-bold text-gray-600 uppercase tracking-wide">Superhost</div>}
                   </div>
                   
                   {/* Stats Side - Yelp Style: Clean layout */}
                   <div className="flex-1 flex flex-col gap-3 pl-6 border-l border-gray-200">
                      <div className="flex flex-col">
                         <span className="font-bold text-xl text-gray-900 leading-none">{details.host.reviewCount || venue.reviews}</span>
                         <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Reviews</span>
                      </div>
                      <div className="w-full h-px bg-gray-200"></div>
                      <div className="flex flex-col">
                         <div className="flex items-center gap-1">
                            <span className="font-bold text-xl text-gray-900 leading-none">{details.host.rating || venue.rating}</span>
                            <Star className="w-3 h-3 fill-[#E0073B] text-[#E0073B]" />
                         </div>
                         <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Rating</span>
                      </div>
                      <div className="w-full h-px bg-gray-200"></div>
                      <div className="flex flex-col">
                         <span className="font-bold text-xl text-gray-900 leading-none">{details.host.yearsHosting || 5}</span>
                         <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Years hosting</span>
                      </div>
                   </div>
                </div>

                {/* Personal Info - Yelp Style: List */}
                <div className="space-y-3 mb-6 text-gray-800 text-sm font-medium">
                   {details.host.work && (
                      <div className="flex gap-3 items-center">
                         <ShoppingBag className="w-4 h-4 text-gray-500" /> 
                         <span>My work: {details.host.work}</span>
                      </div>
                   )}
                   {details.host.funFact && (
                      <div className="flex gap-3 items-center">
                         <div className="w-4 flex justify-center text-gray-500"><span className="text-base line-clamp-1">💡</span></div>
                         <span>Fun fact: {details.host.funFact}</span>
                      </div>
                   )}
                </div>

                {/* Bio */}
                <div>
                  <p className="text-gray-800 leading-relaxed text-sm mb-4 line-clamp-4">{details.host.description}</p>
                  <button className="font-bold text-[#E0073B] text-sm hover:underline flex items-center gap-1">
                    Show more <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
             </div>

             {/* RIGHT COLUMN - CTA & Details */}
             <div className="flex flex-col gap-6">
                {/* Superhost / Intro */}
                <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-bold mb-2 text-gray-900">{details.host.isSuperhost ? `${details.host.name} is a Superhost` : `Hosted by ${details.host.name}`}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.</p>
                </div>

                {/* Co-hosts */}
                {details.host.coHosts && details.host.coHosts.length > 0 && (
                  <div className="border-b border-gray-200 pb-6">
                    <h4 className="text-gray-900 font-bold mb-3 text-sm">Co-hosts</h4>
                    <div className="flex gap-3">
                       {details.host.coHosts.map((ch, idx) => (
                         <div key={idx} className="flex items-center gap-2">
                           <Image src={ch.avatar} width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-gray-200" alt={ch.name} />
                           <span className="font-semibold text-gray-800 text-sm">{ch.name}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {/* Host Details Stats */}
                <div className="space-y-1 mb-2">
                   <h4 className="font-bold text-gray-900 text-sm mb-2">Host details</h4>
                   <p className="text-gray-700 text-sm">Response rate: {details.host.responseRate}%</p>
                   <p className="text-gray-700 text-sm">Responds {details.host.responseTime}</p>
                </div>

                {/* Yelp Style Button: Brand color, bold, rounded-md */}
                <button className="bg-[#E0073B] text-white px-6 py-2.5 rounded-md font-bold text-base shadow-sm hover:bg-[#b0052e] transition self-start">
                   Message Host
                </button>

                <div className="flex items-start gap-3 text-xs text-gray-500 border-t border-gray-200 pt-6 mt-2">
                   <ShieldCheck className="w-5 h-5 text-gray-400 shrink-0" />
                   <p>To help protect your payment, always use FoxPassport to send money and communicate with hosts.</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </main>
  );
}

// --- SUB-COMPONENTS ---
function RatingBar({ label, score }: { label: string, score: number }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-gray-700 w-28 font-medium">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-sm overflow-hidden">
        <div className="h-full bg-[#E0073B] rounded-sm" style={{ width: `${(score / 5) * 100}%` }}></div>
      </div>
      <span className="font-bold text-gray-700 w-6 text-right">{score}</span>
    </div>
  );
}

function ReviewCard({ name, date, location, comment, images }: { name: string, date: string, location?: string, comment: string, images?: string[] }) {
  return (
    <div className="border-b border-gray-200 pb-8 last:border-0">
      <div className="flex gap-4 mb-3">
        <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden shrink-0 border border-gray-300">
           <Image src={`https://i.pravatar.cc/150?u=${name}`} width={64} height={64} className="w-full h-full object-cover" alt={name} />
        </div>
        <div>
            <h4 className="font-bold text-gray-900 text-base">{name}</h4>
            {location && <p className="text-gray-500 text-xs font-bold mb-1">{location}</p>} 
            <div className="flex items-center gap-2">
                 <div className="flex text-[#E0073B]">
                    <Star className="w-4 h-4 fill-[#E0073B]" />
                    <Star className="w-4 h-4 fill-[#E0073B]" />
                    <Star className="w-4 h-4 fill-[#E0073B]" />
                    <Star className="w-4 h-4 fill-[#E0073B]" />
                    <Star className="w-4 h-4 fill-[#E0073B]" />
                 </div>
                 <span className="text-sm text-gray-400">{date}</span>
            </div>
        </div>
      </div>
      <p className="text-gray-800 leading-relaxed text-[15px]">{comment}</p>
      <div className="mt-4 flex gap-4">
         <button className="flex items-center gap-1 text-gray-500 text-sm font-bold hover:bg-gray-100 px-2 py-1 rounded">
            <span className="text-lg">💡</span> Useful
         </button>
         <button className="flex items-center gap-1 text-gray-500 text-sm font-bold hover:bg-gray-100 px-2 py-1 rounded">
            <span className="text-lg">😂</span> Funny
         </button>
         <button className="flex items-center gap-1 text-gray-500 text-sm font-bold hover:bg-gray-100 px-2 py-1 rounded">
            <span className="text-lg">😎</span> Cool
         </button>
      </div>
    </div>
  );
}