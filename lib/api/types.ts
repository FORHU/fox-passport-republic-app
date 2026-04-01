export type Id = string | number;

export type BackendCategory = {
  id?: Id;
  name?: string;
  slug?: string;
  icon?: string;
};

export type BackendAssetImage = {
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
  type?: string | null;
  status?: string | null;
  condition?: string | null;
  price?: number | string | null;
  unit?: string | null;
  billingRate?: string | null;
  hostId?: Id | null;
  ownerId?: Id | null;
  category?: BackendCategory | string | null;
  assetImages?: BackendAssetImage[] | null;
};

export type BackendService = {
  id: Id;
  name: string;
  description?: string | null;
  status?: string | null;
  price?: number | string | null;
  unit?: string | null;
  billingRate?: string | null;
  hostId?: Id | null;
  category?: BackendCategory | string | null;
  assetImages?: BackendAssetImage[] | null;
};

export type CreateAssetPayload = {
  name: string;
  description: string;
  condition: string;
  categorySlug?: string;
  categoryId?: string | null;
  price: number;
  billingRate: string;
  images?: Array<{
    url: string;
    isThumbnail?: boolean;
    altText?: string;
  }>;
};

export type CreateServicePayload = {
  name: string;
  description: string;
  category: string;
  price: number;
  billingRate: string;
  images?: Array<{
    url: string;
    isThumbnail?: boolean;
    altText?: string;
  }>;
};

