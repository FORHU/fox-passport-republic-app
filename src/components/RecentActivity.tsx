"use client";

import React from "react";
import PropertyCard from "@/src/components/RecentActivityProperty";
import ReviewCard from "@/src/components/RecentActivityReview";
import { useRecentActivity } from "@/src/hooks/useRecentActivity";

// --- Fake Data Generator for Empty Slots ---
const backupReviews = [
  {
    id: "fake-1",
    user: { name: "Sarah K.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    dish: "Cozy Retreat",
    description: "So cozy! The real fireplace was the highlight. Perfect for cold Baguio nights with hot chocolate and good books.",
    likes: 25,
    comments: 6,
    helpful: 15,
  },
  {
    id: "fake-2",
    user: { name: "Miguel T.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    dish: "Nightlife Experience",
    description: "The nightlife here is amazing. Great host! Walking distance to all the best bars and restaurants in Poblacion.",
    likes: 42,
    comments: 8,
    helpful: 20,
  },
  {
    id: "fake-3",
    user: { name: "Anna R.", avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d" },
    dish: "Urban Living",
    description: "Modern and stylish loft. Can get noisy on weekends but that's part of the Poblacion experience! Still loved it.",
    likes: 18,
    comments: 3,
    helpful: 12,
  },
  {
    id: "fake-4",
    user: { name: "Chris D.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    dish: "Island Paradise",
    description: "Eco-friendly bamboo construction with modern comforts. The host's island hopping recommendations were spot on!",
    likes: 30,
    comments: 7,
    helpful: 18,
  },
];

const transformToPropertyData = (activity: any) => ({
  id: activity.id,
  name: activity.business.name,
  images: activity.content.images || (activity.business.image ? [activity.business.image] : []),
  rating: activity.business.rating,
  reviewCount: activity.reviews?.length || 0,
  category: activity.business.category,
  location: activity.business.location,
  details: activity.business.details,
  dates: "Jan 19 – 24",
  price: "₱8,881",
  priceLabel: "for 5 nights",
  isGuestFavorite: activity.business.rating >= 4.9,
});

const transformToReviewData = (review: any) => ({
  id: review.id,
  user: review.user,
  title: review.dish || review.title,
  status: review.status,
  price: review.price,
  description: review.description,
  likes: review.likes,
  comments: review.comments,
  helpful: review.helpful,
  time: review.deliveryTime,
});

export default function RecentActivity() {
  const { 
    activities, 
    isLoading, 
    hasMore, 
    loadMore,
  } = useRecentActivity();

  const getActivity = (index: number) => activities[index] || null;

  const getReviews = (index: number, count: number) => {
    const realReviews = activities[index]?.reviews || [];
    const needed = count - realReviews.length;
    
    if (needed <= 0) {
      return realReviews.slice(0, count);
    }

    const fakes = Array(needed).fill(null).map((_, i) => ({
      ...backupReviews[i % backupReviews.length],
      id: `fake-${index}-${i}`
    }));

    return [...realReviews, ...fakes];
  };

  // Container wrapper style for grouping image with its reviews
  const containerClass = "border-2 border-gray-200 rounded-3xl p-4 md:p-5 bg-white";

  return (
    <section className="py-12 md:py-20 px-4 md:px-10 bg-gray-50">
      <div className="max-w-[1600px] mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-10 md:mb-14 text-center">
          Recent Activity
        </h2>
        
        {isLoading && activities.length === 0 ? (
          <div className="h-[400px] md:h-[800px] bg-gray-200 rounded-xl animate-pulse" />
        ) : (
          <div className="space-y-4 md:space-y-4">
            
            {/* ========== BLOCK 1: [IMG1 + Reviews] | [IMG2 + Reviews] ========== */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Container 1: IMAGE 1 + 3 Reviews */}
              <div className={`${containerClass} flex-1 md:flex-[2]`}>
                <div 
                  className="flex flex-col md:grid gap-4 md:gap-5"
                  style={{
                    gridTemplateColumns: '2fr 1fr',
                    gridTemplateRows: 'repeat(3, 220px)',
                  }}
                >
                  {/* IMAGE 1: Tall (3 rows) */}
                  {getActivity(0) && (
                    <div 
                      className="w-full h-[400px] md:h-full relative"
                      style={{ gridColumn: '1', gridRow: '1 / 4' }}
                    >
                      <PropertyCard data={transformToPropertyData(getActivity(0))} />
                    </div>
                  )}
                  
                  {/* Reviews for Image 1 */}
                  {getReviews(0, 3).map((review, idx) => (
                    <div key={review.id} className="w-full" style={{ gridColumn: '2', gridRow: `${idx + 1}` }}>
                      <ReviewCard review={transformToReviewData(review)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Container 2: IMAGE 2 + 2 Reviews */}
              <div className={`${containerClass} flex-1 md:flex-[3]`}>
                <div 
                  className="flex flex-col md:grid gap-4 md:gap-5"
                  style={{
                    gridTemplateColumns: '1fr',
                    gridTemplateRows: '440px 220px',
                  }}
                >
                  {/* IMAGE 2: Top (2/3 height) */}
                  {getActivity(1) && (
                    <div className="w-full h-[300px] md:h-full relative">
                      <PropertyCard data={transformToPropertyData(getActivity(1))} />
                    </div>
                  )}
                  
                  {/* Reviews for Image 2 - side by side */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {getReviews(1, 2).map((review) => (
                      <ReviewCard key={review.id} review={transformToReviewData(review)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ========== BLOCK 2: [IMG3 + 2x2 Reviews] ========== */}
            <div className={containerClass}>
              <div 
                className="flex flex-col md:grid gap-4 md:gap-5"
                style={{
                  gridTemplateColumns: '3fr 1fr 1fr',
                  gridTemplateRows: 'repeat(2, 220px)',
                }}
              >
                {/* IMAGE 3: Tall (2 rows) */}
                {getActivity(2) && (
                  <div 
                    className="w-full h-[400px] md:h-full relative"
                    style={{ gridColumn: '1', gridRow: '1 / 3' }}
                  >
                    <PropertyCard data={transformToPropertyData(getActivity(2))} />
                  </div>
                )}
                
                {/* 2x2 Reviews */}
                {getReviews(2, 4)[0] && <div className="w-full" style={{ gridColumn: '2', gridRow: '1' }}><ReviewCard review={transformToReviewData(getReviews(2, 4)[0])} /></div>}
                {getReviews(2, 4)[1] && <div className="w-full" style={{ gridColumn: '3', gridRow: '1' }}><ReviewCard review={transformToReviewData(getReviews(2, 4)[1])} /></div>}
                {getReviews(2, 4)[2] && <div className="w-full" style={{ gridColumn: '2', gridRow: '2' }}><ReviewCard review={transformToReviewData(getReviews(2, 4)[2])} /></div>}
                {getReviews(2, 4)[3] && <div className="w-full" style={{ gridColumn: '3', gridRow: '2' }}><ReviewCard review={transformToReviewData(getReviews(2, 4)[3])} /></div>}
              </div>
            </div>

            {/* ========== BLOCK 3: [IMG4 + Reviews] | [IMG5 + Reviews] ========== */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Container 3: IMAGE 4 + 2 Reviews */}
              <div className={`${containerClass} flex-1 md:flex-[2]`}>
                <div 
                  className="flex flex-col md:grid gap-4 md:gap-5"
                  style={{
                    gridTemplateColumns: '2fr 1fr',
                    gridTemplateRows: 'repeat(2, 220px)',
                  }}
                >
                  {/* IMAGE 4: Tall (2 rows) */}
                  {getActivity(3) && (
                    <div 
                      className="w-full h-[400px] md:h-full relative"
                      style={{ gridColumn: '1', gridRow: '1 / 3' }}
                    >
                      <PropertyCard data={transformToPropertyData(getActivity(3))} />
                    </div>
                  )}

                  {/* Reviews for Image 4 */}
                  {getReviews(3, 2).map((review, idx) => (
                    <div key={review.id} className="w-full" style={{ gridColumn: '2', gridRow: `${idx + 1}` }}>
                      <ReviewCard review={transformToReviewData(review)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Container 4: IMAGE 5 + 2 Reviews */}
              <div className={`${containerClass} flex-1 md:flex-[2]`}>
                <div 
                  className="flex flex-col md:grid gap-4 md:gap-5"
                  style={{
                    gridTemplateColumns: '1fr',
                    gridTemplateRows: '220px 220px',
                  }}
                >
                  {/* IMAGE 5: Wide */}
                  {getActivity(4) && (
                    <div className="w-full h-[300px] md:h-full relative">
                      <PropertyCard 
                        data={transformToPropertyData(getActivity(4))} 
                        variant="horizontal" 
                      />
                    </div>
                  )}
                  
                  {/* Reviews for Image 5 - side by side */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {getReviews(4, 2).map((review) => (
                      <ReviewCard key={review.id} review={transformToReviewData(review)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ========== BLOCK 4: [IMG6 + Reviews] | [IMG7 + Reviews] ========== */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Container 5: IMAGE 6 + 3 Reviews */}
              <div className={`${containerClass} flex-1 md:flex-[2]`}>
                <div 
                  className="flex flex-col md:grid gap-4 md:gap-5"
                  style={{
                    gridTemplateColumns: '2fr 1fr',
                    gridTemplateRows: 'repeat(3, 220px)',
                  }}
                >
                  {/* IMAGE 6: Tall (3 rows) */}
                  {getActivity(5) && (
                    <div 
                      className="w-full h-[400px] md:h-full relative"
                      style={{ gridColumn: '1', gridRow: '1 / 4' }}
                    >
                      <PropertyCard data={transformToPropertyData(getActivity(5))} />
                    </div>
                  )}
                  
                  {/* Reviews for Image 6 */}
                  {getReviews(5, 3).map((review, idx) => (
                    <div key={review.id} className="w-full" style={{ gridColumn: '2', gridRow: `${idx + 1}` }}>
                      <ReviewCard review={transformToReviewData(review)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Container 6: IMAGE 7 + 2 Reviews */}
              <div className={`${containerClass} flex-1 md:flex-[3]`}>
                <div 
                  className="flex flex-col md:grid gap-4 md:gap-5"
                  style={{
                    gridTemplateColumns: '1fr',
                    gridTemplateRows: '440px 220px',
                  }}
                >
                  {/* IMAGE 7: Top (2/3 height) */}
                  {getActivity(6) && (
                    <div className="w-full h-[300px] md:h-full relative">
                      <PropertyCard data={transformToPropertyData(getActivity(6))} />
                    </div>
                  )}
                  
                  {/* Reviews for Image 7 - side by side */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {getReviews(6, 2).map((review) => (
                      <ReviewCard key={review.id} review={transformToReviewData(review)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {activities.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No activities found</p>
              </div>
            )}
          </div>
        )}
        
        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 md:mt-12 text-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="text-gray-900 font-semibold hover:bg-gray-100 border-2 border-gray-900 px-8 py-3 rounded-full text-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Show more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}