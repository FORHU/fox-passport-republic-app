type TVenueSpace = {
  form_steps?: number; 
  _id?: string;
  name: string;
  space_photo: string[] | [] | TFile[];
  menu_photo?: string [] | [] | TFile[];
  venue_photo?: string[] | [] | TFile[];
  capacity_layout: TCapacityLayout[];
  guest_capacity: TGuestCapacity;
  floor_plan: string[] | [] | TFile[];
  features: TFeatures[];
  keywords: TKeyword[];
  pricing: TPricing;
  venue: Partial<TVenue>;
  marked_as_favorite: {
    _id: string;
    isFavorite: boolean;
  };
  status: string | null;
  type: string;
  description: string;
  representation: string;
};

type TFile = {
  contentType: string;
  createdAt: string | null;
  description: string;
  filename: string;
  path: string;
  size: number;
  updatedAt: string | null;
  uploadedBy: string;
  _id: string;
};

type TCapacityLayout = {
  question: string;
  answer: boolean;
  type: "SPACE";
  options: string[];
  reference: string;
  key: string;
  max_capacity: number | null;
  _id?: string;
  space_id?: string;
};

type TGuestCapacity = {
  minimum: number | null;
  maximum: number | null;
  floorspace: {
    value: number | null;
    unit: "SQM" | "SQFT";
  };
};

type TFeatures = {
  question: string;
  answer: boolean;
  type: "SPACE";
  options: string[];
  reference: string;
  key: string;
  _id?: string;
  space_id?: string;
  max_capacity?: any;
};

type TPricing = {
  selected_pricing: "HIRE_FEE" | "CUSTOM_PRICE";
  currency: string;
  cleaning_fee: number | null;
  hire_fee?: {
    days: any[];
    minimum_booking_hours: string | null;
    hire_fee_comment: string | null;
  };
  custom_price?: {
    opening_hours_preview?: any;
    prices: any[];
    opening_hours_preview?: any;
    opening_hours_private_hour: boolean;
    flexible_pricing_description: string;
    pricing_description?: string;
    catering_prices_description?: string;
    package_per_person_description?: string;
  };
};

type TCustomPricingType =
  | "MINIMUM_SPEND"
  | "HIRE_FEE"
  | "PACKAGE_FEE"
  | "HIRE_FEE_MINIMUM_SPEND"
  | "HIRE_FEE_PACKAGE_FEE";



  declare interface ISpaceManagementListQuery {
    venueId: string;
    page: number;
    limit: number;
    status?: string;
  }