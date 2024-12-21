export default class MOffer implements TOffer {
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
  booking: any;
  user: any;
  cleaning_fee: string;
  agree_to_terms: boolean | null;
  message_to_owner: string;
  status: string | null;

  constructor(offer: Partial<TOffer> = {}) {
    this._id = offer._id || null;
    this.date = offer.date || {
      date: "",
      from: "",
      to: "",
    };
    this.guests = offer.guests || null;
    this.description = offer.description || "";
    this.venue_computation = offer.venue_computation || {
      subtotal: null,
      cleaning_fee: null,
      grand_total: null,
      commission_fee: 0,
    };
    this.user_computation = offer.user_computation || {
      subtotal: null,
      cleaning_fee: null,
      grand_total: null,
      rebate: 0,
    };
    this.currency = offer.currency || "SGD";
    this.notes = offer.notes || "";
    this.message_to_owner = offer.message_to_owner || "";
    this.booking = offer.booking || null;
    this.user = offer.user || null;
    this.cleaning_fee = offer.cleaning_fee || "";
    this.agree_to_terms = offer.agree_to_terms || null;
    this.message_to_owner = offer.message_to_owner || "";
    this.status = offer.status || null;
  }
}
