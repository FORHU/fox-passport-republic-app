export type Id = string | number;

export type BackendCategory = {
  id?: Id;
  name?: string;
  slug?: string;
  icon?: string;
};

export type BackendImage = {
  id?: Id;
  url?: string;
  imageUrl?: string;
  isThumbnail?: boolean;
  isPrimary?: boolean;
  altText?: string;
};

export type BackendAsset = {
  id: Id;
  name: string;
  description?: string | null;
  status?: string | null;
  condition?: string | null;
  price?: number | string | null;
  billingRate?: string | null;
  ownerId?: Id | null;
  category?: string | null;
  images?: BackendImage[] | null;
};

export type BackendService = {
  id: Id;
  name: string;
  description?: string | null;
  status?: string | null;
  price?: number | string | null;
  billingRate?: string | null;
  ownerId?: Id | null;
  category?: string | null;
  city?: string | null;
  country?: string | null;
  images?: BackendImage[] | null;
};

export type CreateAssetPayload = {
  name: string;
  description: string;
  condition: string;
  category: string;
  price: number;
  billingRate: string;
  quantity?: number;
  imgIds: string[];
};

export type CreateServicePayload = {
  name: string;
  description: string;
  category: string;
  price: number;
  billingRate: string;
  city: string;
  country: string;
  state?: string;
  isWillingToTravel?: boolean;
  tags?: string[];
  imgIds: string[];
};
