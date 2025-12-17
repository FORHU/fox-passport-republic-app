"use client";

import React from "react";
import Navbar from "@/src/components/Navbar";
import { 
  Star, MapPin, Share, Heart, CheckCircle, 
  Wifi, Car, Utensils, Monitor, Wind, 
  Tv, Waves, Coffee, Medal,
  Camera, ShoppingBag, X, ChevronLeft, ChevronRight
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
            <a href="/" className="text-blue-600 underline">Go back home</a>
        </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-20">
      <Navbar />
      
      {/* --- SPLIT-VIEW GALLERY MODAL --- */}
      {gallery.isOpen && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in fade-in duration-200 h-screen max-h-screen overflow-hidden">
          {/* Top Bar */}
          <div className="flex justify-between items-center p-4 bg-black text-white shrink-0 z-10 relative border-b border-white/10">
            <button 
              onClick={gallery.close}
              className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
            >
              <X className="w-5 h-5" /> 
              <span className="text-sm font-semibold">Close</span>
            </button>
            <div className="text-sm font-medium absolute left-1/2 -translate-x-1/2">
              {gallery.index + 1} / {gallery.richData.length}
            </div>
            <div className="flex gap-4 opacity-0 md:opacity-100">
               <button className="p-2 hover:bg-white/10 rounded-full"><Share className="w-5 h-5" /></button>
               <button className="p-2 hover:bg-white/10 rounded-full"><Heart className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col md:flex-row h-full relative overflow-hidden">
              {/* Left Column: Image */}
              <div className="flex-1 relative flex items-center justify-center bg-black p-4 md:p-0 h-[50vh] md:h-auto overflow-hidden group">
                  <img 
                    src={gallery.richData[gallery.index].src} 
                    alt={`Gallery ${gallery.index + 1}`} 
                    className="max-h-full max-w-full object-contain shadow-2xl transition-transform duration-300"
                  />
                  <button onClick={gallery.prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100 md:opacity-100">
                      <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={gallery.next} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100 md:opacity-100">
                      <ChevronRight className="w-6 h-6" />
                  </button>
              </div>

              {/* Right Column: Sidebar Info */}
              <div className="w-full md:w-[400px] bg-white p-6 md:p-8 overflow-y-auto border-l border-gray-200 flex flex-col h-full shrink-0">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                      <img src={details.host.avatar} alt={details.host.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                          <h3 className="font-bold text-gray-900">Hosted by {details.host.name}</h3>
                          <p className="text-sm text-gray-500">{details.host.isSuperhost ? "Superhost" : "Host"}</p>
                      </div>
                  </div>
                  <div className="flex-1 mb-6">
                      <div className="flex items-start gap-2 text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">
                          <Camera className="w-4 h-4" />
                          <span>{gallery.richData[gallery.index].photographer}</span>
                      </div>
                      <p className="text-gray-800 text-lg leading-relaxed font-light">
                          {gallery.richData[gallery.index].caption}
                      </p>
                  </div>
                  <div className="mt-auto pt-6 border-t border-gray-100 text-sm text-gray-500">
                      <p className="font-semibold text-gray-900 mb-1">{venue.title}</p>
                      <p>{venue.location}, {venue.province}</p>
                  </div>
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
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-sm font-semibold hover:bg-gray-100 px-3 py-2 rounded-lg underline decoration-1">
                <Share className="w-4 h-4" /> Share
              </button>
              <button className="flex items-center gap-2 text-sm font-semibold hover:bg-gray-100 px-3 py-2 rounded-lg underline decoration-1">
                <Heart className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>

        {/* --- IMAGE GRID --- */}
        <div className="relative rounded-2xl overflow-hidden grid grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[450px] mb-8 md:mb-12">
          {/* Main Image */}
          <div className="col-span-2 row-span-2 relative group cursor-pointer" onClick={() => gallery.open(0)}>
            <img src={gallery.images[0]} className="w-full h-full object-cover hover:brightness-90 transition duration-300" alt="Main" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />
          </div>
          {/* Sub Images */}
          {gallery.images.slice(1, 5).map((img, idx) => (
            <div key={idx} className="col-span-1 row-span-1 relative group cursor-pointer" onClick={() => gallery.open(idx + 1)}>
              <img src={img} className="w-full h-full object-cover hover:brightness-90 transition duration-300" alt={`Sub ${idx}`} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />
            </div>
          ))}
          <button onClick={() => gallery.open(0)} className="absolute bottom-5 right-5 bg-white border border-black px-4 py-1.5 rounded-lg text-sm font-semibold shadow-md hover:bg-gray-100 transition flex items-center gap-2 z-10">
            <div className="grid grid-cols-3 gap-0.5 w-3.5 mr-1">
               {[...Array(9)].map((_, i) => <div key={i} className="w-[3px] h-[3px] bg-black rounded-full" />)}
            </div>
            Show all photos
          </button>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr] gap-12 relative">
          
          {/* Left Column */}
          <div>
            {/* Host Section */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-6 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Entire {venue.category} hosted by {details.host.name}</h2>
                <p className="text-gray-600 text-sm md:text-base">{venue.guestCount} guests · {venue.bedroomCount} bedroom · {venue.bathroomCount} bath</p>
              </div>
              <img src={details.host.avatar} alt={details.host.name} className="w-14 h-14 rounded-full object-cover border border-gray-200" />
            </div>

            {/* Highlights */}
            <div className="border-b border-gray-200 pb-6 mb-6 space-y-5">
              <div className="flex gap-4">
                <Medal className="w-6 h-6 text-gray-900 shrink-0" />
                <div><h3 className="font-bold text-gray-900">Superhost</h3><p className="text-gray-500 text-sm">Experienced, highly rated host.</p></div>
              </div>
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-gray-900 shrink-0" />
                <div><h3 className="font-bold text-gray-900">Great location</h3><p className="text-gray-500 text-sm">95% of guests gave a 5-star rating.</p></div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b border-gray-200 pb-6 mb-6">
               <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{venue.description}</p>
               <button className="mt-4 font-bold underline flex items-center gap-1">Show more ›</button>
            </div>

            {/* Sleeping */}
            <div className="border-b border-gray-200 pb-6 mb-6">
               <h3 className="font-bold text-xl mb-4">Where you&apos;ll sleep</h3>
               <div className="border border-gray-200 rounded-xl p-6 w-full md:w-1/2 bg-gray-50">
                  <div className="mb-4 text-2xl">🛏️</div>
                  <div className="font-bold mb-1">Bedroom</div>
                  <div className="text-sm text-gray-500">1 queen bed</div>
               </div>
            </div>

            {/* Amenities */}
            <div className="border-b border-gray-200 pb-6 mb-6">
               <h3 className="font-bold text-xl mb-4">What this place offers</h3>
               <div className="grid grid-cols-2 gap-4">
                 {venue.offers.map((offer, i) => (
                   <div key={i} className="flex items-center gap-3 text-gray-700">
                     {getAmenityIcon(offer)}<span className="font-light">{offer}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Activities */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h3 className="font-bold text-xl mb-4">Things to do nearby</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {details.displayActivities.map((activity, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl bg-white hover:shadow-md transition cursor-pointer">
                          <div className="mt-1 bg-gray-100 p-2 rounded-full">{getActivityIcon(i)}</div>
                          <div><h4 className="font-semibold text-gray-900 text-sm">{activity}</h4><p className="text-xs text-gray-500 mt-0.5">Recommended spot</p></div>
                      </div>
                  ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h3 className="font-bold text-xl mb-1">{booking.nights > 0 ? `${booking.nights} nights` : "Select dates"} in {venue.location}</h3>
              <p className="text-gray-500 text-sm mb-6">{booking.formatDate(booking.dateRange.start)} - {booking.formatDate(booking.dateRange.end)}</p>
              <div className="bg-gray-50 rounded-xl p-4 md:p-6 flex justify-center">
                 <DatePicker inline onSelectDates={(start, end) => booking.setDateRange({ start, end })} onClose={() => {}} />
              </div>
            </div>
          </div>

          {/* Sticky Booking Card */}
          <div className="relative">
            <div className="sticky top-28 bg-white border border-gray-200 shadow-xl rounded-xl p-6">
              <div className="flex justify-between items-end mb-5">
                <div><span className="text-xl font-bold">₱{venue.price.toLocaleString()}</span><span className="text-gray-500 text-sm"> / night</span></div>
                <div className="flex items-center gap-1 text-sm underline font-semibold"><Star className="w-3.5 h-3.5 fill-black text-black" /><span>{venue.rating} · {venue.reviews} reviews</span></div>
              </div>
              <div className="border border-gray-400 rounded-lg overflow-hidden mb-4">
                <div className="flex border-b border-gray-400">
                  <div className="flex-1 p-3 border-r border-gray-400 bg-white"><label className="block text-[10px] font-bold uppercase text-gray-700">Check-in</label><div className="text-sm text-gray-500 truncate">{booking.formatDate(booking.dateRange.start)}</div></div>
                  <div className="flex-1 p-3 bg-white"><label className="block text-[10px] font-bold uppercase text-gray-700">Check-out</label><div className="text-sm text-gray-500 truncate">{booking.formatDate(booking.dateRange.end)}</div></div>
                </div>
                <div className="p-3 bg-white"><label className="block text-[10px] font-bold uppercase text-gray-700">Guests</label><div className="text-sm text-gray-500">{booking.guestsParam || 1} guest</div></div>
              </div>
              <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 rounded-lg transition-colors mb-4 text-lg">Reserve</button>
              <div className="space-y-3 text-gray-600 text-base">
                <div className="flex justify-between underline"><span>₱{venue.price.toLocaleString()} x {booking.nights} nights</span><span>₱{booking.stayTotal.toLocaleString()}</span></div>
                <div className="flex justify-between underline"><span>Service fee</span><span>₱{booking.serviceFee.toLocaleString()}</span></div>
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-lg"><span>Total</span><span>₱{booking.grandTotal.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="py-12 border-t border-gray-200 mt-8">
           <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><Star className="w-5 h-5 fill-black" /> {venue.rating} · {venue.reviews} reviews</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-8">
              <RatingBar label="Cleanliness" score={details.ratingCats.cleanliness} />
              <RatingBar label="Accuracy" score={details.ratingCats.accuracy} />
              <RatingBar label="Check-in" score={details.ratingCats.checkIn} />
              <RatingBar label="Communication" score={details.ratingCats.communication} />
              <RatingBar label="Location" score={details.ratingCats.location} />
              <RatingBar label="Value" score={details.ratingCats.value} />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ReviewCard name="Sarah K." date="January 2024" comment="So cozy! The real fireplace was the highlight. Perfect for cold Baguio nights." />
              <ReviewCard name="Mike T." date="December 2023" comment="Great location, very quiet. The host Benjie was extremely helpful with directions." />
           </div>
        </div>

        {/* Host (Bottom) */}
        <div className="py-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Meet your Host</h2>
          <div className="bg-gray-50 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-[400px_1fr] gap-12">
             <div className="bg-white rounded-2xl p-8 shadow-lg text-center h-fit">
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <img src={details.host.avatar} className="w-full h-full rounded-full object-cover" alt="Host" />
                  {details.host.isSuperhost && <div className="absolute bottom-1 right-0 bg-pink-600 text-white rounded-full p-1.5"><Medal className="w-4 h-4" /></div>}
                </div>
                <h3 className="text-2xl font-bold mb-1">{details.host.name}</h3>
                <p className="text-gray-500 text-sm mb-6">Superhost</p>
                <div className="text-left space-y-3">
                   <div className="flex justify-between border-b pb-2"><span>Reviews</span><span className="font-bold text-black">{venue.reviews}</span></div>
                   <div className="flex justify-between border-b pb-2"><span>Rating</span><span className="font-bold text-black">{venue.rating}</span></div>
                   <div className="flex justify-between"><span>Years hosting</span><span className="font-bold text-black">5</span></div>
                </div>
             </div>
             <div className="flex flex-col justify-center">
                 <h3 className="font-bold text-xl mb-4">Host details</h3>
                 <p className="text-gray-600 mb-6 leading-relaxed">Response rate: 100%<br/>Responds within an hour</p>
                 <button className="bg-black text-white px-6 py-3 rounded-lg font-bold self-start hover:bg-gray-800 transition">Message Host</button>
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
    <div className="flex justify-between items-center gap-4">
      <span className="text-gray-700 w-32">{label}</span>
      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-black rounded-full" style={{ width: `${(score / 5) * 100}%` }}></div>
      </div>
      <span className="text-sm font-bold w-8 text-right">{score}</span>
    </div>
  );
}

function ReviewCard({ name, date, comment }: { name: string, date: string, comment: string }) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
           <img src={`https://i.pravatar.cc/150?u=${name}`} alt={name} />
        </div>
        <div><h4 className="font-bold text-gray-900">{name}</h4><p className="text-sm text-gray-500">{date}</p></div>
      </div>
      <p className="text-gray-700 leading-relaxed">{comment}</p>
      <button className="mt-2 text-sm font-bold underline">Show more</button>
    </div>
  );
}