declare type TVenue = {
  _id?: string;
  form_steps?: number;
  address: TVenueAddress;
  description: string;
  foods_and_beverages: TFoodAndBeverages[];
  keywords: TKeyword[] | [];
  name: string;
  representation: string;
  status: string | null;
  venue_spaces: TVenueSpace[] | [];
  venue_details: TVenueDetails[];
  age_restriction: TAgeRestriction;
  cancellation_policy: TCancellationPolicy;
  venue_photos?: any[];
  user?: Partial<TUser>;
  commission: number | null;
  payment_method: 'SUBSCRIPTION' | 'COMMISSION' | null;
};

declare type TFoodAndBeverages = {
  question: string;
  answer: boolean;
  type: string;
  options: string[];
  reference: string;
  key: string;
  _id?: string;
  venue_id?: string;
  max_capacity?: any;
  subtitle?: string;
};

declare type TVenueDetails = {
  question: string;
  answer: boolean;
  type: string;
  options: string[];
  reference: string;
  key: string;
  _id?: string;
  venue_id?: string;
  max_capacity?: any;
};

declare type TVenueSpace = {
  name: string;
  type: string;
  description: string;
  representation: string;
  features: string[];
};

declare type TKeyword = {
  keyword: string;
  categories: string[];
  type: string;
  _id?: string;
  status?: string; // used in migration
};

declare type TCancellationPolicy = {
  _id?: string;
  venue_id?: string;
  createdAt?: string;
  description?: string;
  policy: {
    cancellation_range: string;
    no_cancellation: boolean;
    custom: {
      days_at_least: {
        number_of_days: number | null;
        total_price: number | null;
      };
      days_less_than: {
        number_of_days: number | null;
        total_price: number | null;
      };
      days_less_than_but_at_least: any[];
    };
  };
  allow_rescheduling: {
    answer: boolean;
    months: number | null;
  };
};

declare type TVenueAddress = {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string | number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

declare type TAgeRestriction = {
  answer: boolean;
  min_age_requirement: null | number;
  enforcement_time: string | null;
};
