// Reviews Data Constants

export interface ReviewCategory {
  id: string;
  label: string;
}

export interface MockReview {
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  date: string;
  text: string;
}

export const REVIEW_CATEGORIES: ReviewCategory[] = [
  { id: "food", label: "Food" },
  { id: "service", label: "Service" },
  { id: "ambiance", label: "Ambiance" },
];

export const MOCK_RECENT_REVIEWS: MockReview[] = [
  {
    user: { name: "Rocco B.", avatar: "https://i.pravatar.cc/150?u=1" },
    rating: 5,
    date: "Oct 7, 2025",
    text: "This is the Tony's Slice House of the East Bay. The pizza is phenomenal and so glad to have found a place like this in Albany when I'm craving 'the good stuff'.",
  },
  {
    user: { name: "Elle D.", avatar: "https://i.pravatar.cc/150?u=2" },
    rating: 5,
    date: "Dec 16, 2025",
    text: "I read about Raymond's on a Bay Area Reddit post. Rating a coconut slice of champorado. Nilagang and Gata. I was excited to try some gourmet pizza...",
  },
];
