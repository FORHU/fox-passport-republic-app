export default class MUser implements TUser {
  _id: string;
  first_name: string;
  middleName: string;
  last_name: string;
  address: TAddress;
  email: string;
  country: string;
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
  assigned_roles?: null | string;
  room_id?: string;

  constructor(user: Partial<TUser> = {}) {
    this._id = user._id || "";
    this.first_name = user.first_name || "";
    this.middleName = user.middleName || "";
    this.last_name = user.last_name || "";
    this.address =
      user.address || ({ country: "", city: "", postalCode: "" } as TAddress);
    this.email = user.email || "";
    this.country = user.country || "";
    this.password = user.password || "";
    this.type = user.type || "";
    this.role = user.role || [];
    this.createdAt = user.createdAt || "";
    this.updatedAt = user.updatedAt || "";
    this.organization = user.organization || "";
    this.sites = user.sites || [];
    this.status = user.status || "";
    this.profile_picture = user.profile_picture || "";
    this.date_of_birth = user.date_of_birth || "";
    this.phone_number = user.phone_number || "";
    this.stripe_account = user.stripe_account || "";
    this.assigned_roles = user.assigned_roles || null;
    // Only assign room_id if it exists
    if (user.room_id) {
      this.room_id = user.room_id;
    }
  }
}
