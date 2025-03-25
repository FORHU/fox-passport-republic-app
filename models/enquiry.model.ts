import MVenue from "~/models/venue.model";
import MVenueSpace from "~/models/space.model";

export default class MEnquiry implements TEnquiry {
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
  catering_options?: TCateringOptions[] | undefined;
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
  cancelledBy: { role: "USER" | "VENUE_OWNER" | null; _id: string | null };
  read?: boolean;

  constructor(enquiry: Partial<TEnquiry> = {}) {
    this._id = enquiry._id || "";
    this.date = enquiry.date || {
      date: "",
      timestamp: {
        start_date_time: "",
        end_date_time: "",
      },
      from: "",
      to: "",
    };
    this.type = enquiry.type || "";
    this.guests = enquiry.guests || null;
    this.value = enquiry.value || null;
    this.own_catering = enquiry.own_catering || false;
    this.require_catering = enquiry.require_catering || false;
    this.catering_options = enquiry.catering_options || undefined;
    this.flexible_time = enquiry.flexible_time || false;
    this.status = enquiry.status || "INPROGRESS";
    this.space = new MVenueSpace( enquiry.space);
    this.inbox = {
      _id: enquiry.inbox?._id || "",
      room_id: enquiry.inbox?.room_id || "",
      sender: enquiry.inbox?.sender || "",
      receiver: enquiry.inbox?.receiver || null,
      createdAt: enquiry.inbox?.createdAt || null,
      updatedAt: enquiry.inbox?.updatedAt || null,
      deletedAt: enquiry.inbox?.deletedAt || null,
    };
    this.venue = new MVenue(enquiry.venue);
    this.user = enquiry.user || {
      _id: "",
      first_name: "",
      last_name: "",
      email: "",
      profile_picture: "",
    };
    this.latest_message = enquiry.latest_message || "";
    this.cancelledBy = enquiry.cancelledBy || { role: null, _id: null };
    this.read = enquiry.read || true;
  }
}
