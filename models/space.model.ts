import MVenue from "./venue.model";
export default class MSpace implements TVenueSpace {
  form_steps?: number;
  _id?: string;
  name: string;
  space_photo: string[] | [] | TFile[];
  menu_photo?: string[] | [] | TFile[];
  capacity_layout: TCapacityLayout[];
  guest_capacity: TGuestCapacity;
  floor_plan: string[] | [] | TFile[];
  features: TFeatures[];
  keywords: TKeyword[];
  pricing: TPricing;
  venue: Partial<TVenue>;
  status: string | null;
  type: string;
  description: string;
  representation: string;
  marked_as_favorite: {
    _id: string;
    isFavorite: boolean;
  };

  constructor(space: Partial<TVenueSpace> = {}) {
    this.form_steps = space.form_steps || 1;
    this._id = space._id || "";
    this.name = space.name || "";
    this.space_photo = space.space_photo || [];
    this.menu_photo = space.menu_photo || [];
    this.capacity_layout =
      space?.capacity_layout?.map(({ _id, space_id, ...rest }) => rest) || [];
    this.guest_capacity = space.guest_capacity || {
      minimum: null,
      maximum: null,
      floorspace: {
        value: null,
        unit: "SQM",
      },
    };
    this.floor_plan = space.floor_plan || [];
    this.features =
      space?.features?.map(({ _id, space_id, ...rest }) => rest) || [];
    this.keywords = space?.keywords?.map(({ _id, status, ...rest }) => rest) || [];
    this.pricing =
      {
        selected_pricing: space?.pricing?.selected_pricing || "HIRE_FEE",
        currency: space?.pricing?.currency || "",
        hire_fee: {
          days: space?.pricing?.hire_fee?.days || [],
          minimum_booking_hours:
            space?.pricing?.hire_fee?.minimum_booking_hours || "2 hours",
          hire_fee_comment: space?.pricing?.hire_fee?.hire_fee_comment || "",
        },
        cleaning_fee: space?.pricing?.cleaning_fee || null,
        custom_price: {
          opening_hours_preview:
            space?.pricing?.custom_price?.opening_hours_preview,
          prices: space?.pricing?.custom_price?.prices || [],
          opening_hours_private_hour:
            space?.pricing?.custom_price?.opening_hours_private_hour || false,
          flexible_pricing_description:
            space?.pricing?.custom_price?.flexible_pricing_description ||
            "Our prices are set at",
          pricing_description:
            space?.pricing?.custom_price?.pricing_description || "",
          catering_prices_description:
            space?.pricing?.custom_price?.catering_prices_description || "",
          package_per_person_description:
            space?.pricing?.custom_price?.package_per_person_description || "",
        },
      } || [];
    this.venue = new MVenue(space.venue);
    this.status = space.status || null;
    this.type = space.type || "";
    this.description = space.description || "";
    this.representation = space.representation || "THE_WHOLE_VENUE";
    this.marked_as_favorite = {
      _id: space?.marked_as_favorite?._id || "",
      isFavorite: space?.marked_as_favorite?.isFavorite || false,
    };
  }
}
