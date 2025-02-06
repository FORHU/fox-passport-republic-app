declare type TRatings = {
    averageRating: number;
    details: TRatingDetails[];
    space: string;
    totalRatings: number;
    totalReviews: number;
  };
  


  declare type TRatingDetails = {
    createdAt: string | null;
    privateNote: string;
    publicNote: string
    rating: number;
    space: {
      name: string;
      _id: string;
      status: string;
    };
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    updatedAt: string | null;
    user: TUser;
    _id: string;
  };
