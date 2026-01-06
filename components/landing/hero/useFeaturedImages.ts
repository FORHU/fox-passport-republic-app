import { useState, useEffect } from "react";

// Featured images that rotate every 5 seconds
export const FEATURED_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
    label: "Festivals & Fairs",
    title: "Music Festivals & Cultural Fairs",
    credit: "Photo by Pablo Heimplatz on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800",
    label: "Classes & Workshops",
    title: "Learn New Skills & Crafts",
    credit: "Photo by Marvin Meyer on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
    label: "Live Performances",
    title: "Concert & Theater Performances",
    credit: "Photo by Yvette de Wit on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800",
    label: "Tours & Excursions",
    title: "Guided Tours & Adventures",
    credit: "Photo by Toomas Tartes on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
    label: "Parties & Socials",
    title: "Networking & Social Events",
    credit: "Photo by Priscilla Du Preez on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800",
    label: "Markets & Pop-Ups",
    title: "Farmers Markets & Craft Fairs",
    credit: "Photo by Jacek Dylag on Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800",
    label: "Competitions & Games",
    title: "Sports & Gaming Tournaments",
    credit: "Photo by John Arano on Unsplash",
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
