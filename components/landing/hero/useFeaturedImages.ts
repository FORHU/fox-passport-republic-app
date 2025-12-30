import { useState, useEffect } from "react";

// Featured images that rotate every 5 seconds
export const FEATURED_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
    label: "Events",
    title: "Live Music & Festival Nights",
    credit: "Photo by Pablo Heimplatz on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800",
    label: "Adventures",
    title: "Mountain Hiking Expeditions",
    credit: "Photo by Toomas Tartes on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
    label: "Music",
    title: "Concert & Live Performances",
    credit: "Photo by Yvette de Wit on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800",
    label: "Food",
    title: "Culinary Adventures & Dining",
    credit: "Photo by Jay Wennington on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800",
    label: "Camping",
    title: "Outdoor Camping Getaways",
    credit: "Photo by Scott Goodwill on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    label: "Venues",
    title: "Stunning Event Venues",
    credit: "Photo by Edvin Johansson on Unsplash",
  },
];

export const useFeaturedImages = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Rotate featured images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % FEATURED_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    currentImageIndex,
    setCurrentImageIndex,
    featuredImages: FEATURED_IMAGES,
  };
};
