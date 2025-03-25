declare type TEnquiry = {
  _id?: string;
  date: {
    date: string;
    timestamp: {
      start_date_time: string;
      end_date_time: string;
    };
    from: string;
    to: string;
  };
  type: string;
  guests: number | null;
  value: number | null;
  own_catering: boolean;
  require_catering: boolean;
  catering_options?: TCateringOptions[];
  flexible_time: boolean;
  status: string;
  createdAt?: null | string;
  updatedAt?: null | string;
  deletedAt?: null | string;
  deletedBy?: null | string;
  space: TVenueSpace;
  venue: TVenue;
  inbox?: {
    _id: string;
    room_id: string;
    sender: string;
    receiver: null;
    createdAt?: null | string;
    updatedAt?: null | string;
    deletedAt?: null | string;
  };
  user: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture: string;
  };
  latest_message: string;
  cancelledBy: {
    role: "USER" | "VENUE_OWNER" | null;
    _id: string | null;
  };
  read?: boolean;
};

declare type TCateringOptions = {
  name: string;
  value: boolean;
};

declare type TOffer = {
  _id: string | null;
  date: {
    date: string;
    from: string;
    to: string;
  };
  guests: number | null;
  description: string;
  venue_computation: {
    subtotal: string | null;
    cleaning_fee: number | null;
    grand_total: string | null;
    commission_fee: number | null;
  };
  user_computation: {
    subtotal: string | null;
    cleaning_fee: number | null;
    grand_total: string | null;
    rebate: number | null;
  };
  currency: "SGD";
  notes: string;
  cleaning_fee?: string;
  agree_to_terms?: boolean | null;
  message_to_owner?: string;
  booking: any;
  user: any;
  status: string | null;
};

declare type TRefund = {
  allowed: boolean;
  currency: string;
  grand_total: number | null;
  percentage: number | null;
  refund_amount: number | null;
  status: string | null;
};

declare type TComputedOffer = {
  computation_used?: 'PER_HOUR' | 'PER_DAY';
  type?: 'HIRE_FEE' | 'CUSTOM_PRICE'
  duration?: string;
  currency: string;
  date: string | null;
  from: string | null;
  to: string | null;
  guests: number | null;
  payment_computation: {
    user: {
      base_rate?: string | null;
      subtotal: string | null;
      rebate: number | null;
      grand_total: string | null;
      cleaning_fee: number | null;
    };
    venue: {
      subtotal: string | null;
      commission_fee: number | null;
      grand_total: string | null;
      cleaning_fee: number | null;
    };
  };
};


declare type TEnquiryFilterParams = {
  status?: string | null;
  page?: number | null;
  limit?: number | null;
  toggle_current?: boolean;
  search_name?: string | null;
  event_type?: string | null;
  event_date?: string | null;
  guests?: number | null;
}



declare type TCreateCustomOfferPayload = { 
    date: {
      date: string; // Adjust the type if `date` is a Date object
      from: string; // Adjust the type as needed
      to: string; // Adjust the type as needed
    };
    guests: number; // Adjust type if guests is not a number
    venue_computation: {
      subtotal: string;
      commission_fee: number;
      cleaning_fee: number;
      grand_total: string;
    };
    user_computation: {
      subtotal: string;
      rebate: number;
      cleaning_fee: number;
      grand_total: string;
    };
    inbox_id: string; // Adjust type if inbox_id is not a string
    currency: string; // Adjust type if currency is not a string
  }

