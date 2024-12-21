import MUser from "./user.model";

export default class MVenue implements TVenue {
  _id?: string;
  form_steps?: number | undefined;
  address: TVenueAddress;
  description: string;
  foods_and_beverages: TFoodAndBeverages[];
  keywords: TKeyword[] | [];
  name: string;
  representation: string;
  status: string | null;
  venue_spaces: TVenueSpace[] | [];
  venue_details: TVenueDetails[];
  cancellation_policy: TCancellationPolicy;
  age_restriction: TAgeRestriction;
  user: Partial<TUser>;
  commission: number | null;
  payment_method: 'SUBSCRIPTION' | 'COMMISSION' | null;

  constructor(venue: Partial<TVenue> = {}) {
    this._id = venue._id;
    this.form_steps = venue.form_steps || 1;
    this.address = new MVenueAddress(venue.address || {});
    this.description = venue.description || "";
    this.foods_and_beverages =
      venue.foods_and_beverages?.map(({ _id, venue_id, ...rest }) => rest) ||
      [];
    this.keywords = venue.keywords?.map(({ _id, status, ...rest }) => rest) || [];
    this.name = venue.name || "";
    this.representation = venue.representation || "";
    this.status = venue.status || null;
    this.venue_spaces = venue.venue_spaces || [];
    this.venue_details =
      venue.venue_details?.map(({ _id, venue_id, ...rest }) => rest) || [];
    this.age_restriction = {
      answer: venue.age_restriction?.answer || false,
      min_age_requirement: venue.age_restriction?.min_age_requirement || null,
      enforcement_time: venue.age_restriction?.enforcement_time || null,
    };
    this.user = new MUser(venue?.user);
    this.commission = venue.commission || null;
    this.payment_method = venue.payment_method || null;
    this.cancellation_policy = {
      description: venue.cancellation_policy?.description || "",
      policy: {
        cancellation_range:
          venue.cancellation_policy?.policy?.cancellation_range ||
          "VERY_FLEXIBLE",
        no_cancellation:
          venue.cancellation_policy?.policy?.no_cancellation || false,
        custom: {
          days_at_least: {
            number_of_days:
              venue.cancellation_policy?.policy?.custom.days_at_least
                ?.number_of_days || null,
            total_price:
              venue.cancellation_policy?.policy?.custom.days_at_least
                ?.total_price == 0 ? 0 : venue.cancellation_policy?.policy?.custom.days_at_least
                ?.total_price || null,
          },
          days_less_than: {
            number_of_days:
              venue.cancellation_policy?.policy?.custom.days_less_than
                ?.number_of_days || null,
            total_price:
              venue.cancellation_policy?.policy?.custom.days_less_than
                ?.total_price == 0 ? 0: venue.cancellation_policy?.policy?.custom.days_less_than
                ?.total_price || null,
          },
          days_less_than_but_at_least:
            venue.cancellation_policy?.policy?.custom
              ?.days_less_than_but_at_least || [],
        },
      },
      allow_rescheduling: venue.cancellation_policy?.allow_rescheduling || {
        answer: false,
        months: null,
      },
    };
  }
}

export class MVenueAddress implements TVenueAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string | number;
  coordinates: {
    latitude: number;
    longitude: number;
  };

  constructor(address: Partial<TVenueAddress> = {}) {
    this.street = address.street || "";
    this.city = address.city || "";
    this.state = address.state || "";
    this.country = address.country || "";
    this.postal_code = address.postal_code || "";
    this.coordinates = address.coordinates || {
      latitude: 0,
      longitude: 0,
    };
  }
}
