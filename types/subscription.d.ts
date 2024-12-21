declare type TSubscriptionPricing = {
    active: boolean;
    amount: number;
    currency: string;
    description: string;
    interval: 'month';
    livemode: boolean;
    price_id: string;
    type: string;
};

declare type TSubscription = {
    client_secret: string;
    createdAt: string; // ISO 8601 format
    endDate: string; // ISO 8601 format
    fee: number;
    space_number: number;
    status: string;
    subscription_id: string;
    updatedAt: string | null; // Nullable string for possible null value
    user: string;
    venue: string;
    _id: string;
  }

