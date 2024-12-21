export default class MCountry implements TCountry {
  commission: number;
  country_code: string;
  country_name: string;
  createdAt: string;
  currency: string;
  currency_sign: string;
  flag_url: string;
  updatedAt: string | null;
  _id: string;

  constructor(country: Partial<TCountry> = {}) {
    this.commission = country.commission || 0;
    this.country_code = country.country_code || "";
    this.country_name = country.country_name || "";
    this.createdAt = country.createdAt || "";
    this.currency = country.currency || "";
    this.currency_sign = country.currency_sign || "";
    this.flag_url = country.flag_url || "";
    this.updatedAt = country.updatedAt || "";
    this._id = country._id || "";
  }
}
