declare type TAddress = {
  country: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  postalCode: string;
};

declare type TUser = {
  _id: string;
  first_name: string;
  middleName: string;
  last_name: string;
  address: TAddress;
  country: string;
  email: string;
  password: string;
  type: string;
  role: string[];
  createdAt: string;
  updatedAt: string;
  organization: string;
  sites: string[];
  status: string;
  profile_picture: string;
  date_of_birth: string;
  phone_number: string;
  stripe_account: string;
  assigned_roles?: string | null
  room_id?: string
};

declare type TGetUsersByPageSearchResponse = {
  items: TUser[];
  pageRange: string;
  pages: number;
};

// declare type TStripeDetails = {
//   status: string | null;
//   stripe_account_id: string | null;
//   updatedAt: string | null;
//   createdAt: string | null
//   _id: string | null;
// }
