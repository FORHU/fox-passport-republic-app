import MEnquiry from "~/models/enquiry.model";
import MOffer from "~/models/offer.model";
export function useEnquiry() {
  const enquiries = useState("enquiries", (): TEnquiry[] => []);
  const enquiry = useState("enquiry", (): TEnquiry => new MEnquiry());
  const offer = useState("offer", (): TOffer => new MOffer());
  const drawer = useState("drawer", (): boolean => false);
  const activeTab = useState("activeTab", (): "CURRENT" | "PAST" => "CURRENT" )
  const currentPage = useState("chatCurrentPage", (): number => 1);

  // VENUE OWNERS FILTERS
  const eventType = useState("filterEventType", (): string | null => null);
  const date = useState("date", (): string | null => null);
  const guests = useState("guests", (): string | null => null);
  const statusFilter = useState("statusFilter", (): string => 'All');
  const showSearchInput = useState('showSearchInput', (): boolean => false);
  const searchText = useState('searchText', (): string => '')

  // updateEventDetails Obj
  const eventDetails = useState('eventDetails', () => ({
    event_type: "" as string,
    date: null as string | null,
    from: null as string | null,
    to: null as string | null,
    guests: null as number | null,
  }))

  const mode = useCookie<"create" | "update" | "delete" | "view">("mode", {
    default: () => "view",
    watch: true,
  });

  const getEnquiry = async (inquiryId: string, query?: any) => {
    return await useAPI(`/v1/enquiries/${inquiryId}`, {
      query: query ? query : undefined,
    });
  };

  const updateEnquiry = async (inquiryId: string, payload: any) => {
    return await useAPI(`/v1/enquiries/${inquiryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  };



  const getEnquiryList = async (params: TEnquiryFilterParams) => {
  
    return await useAPI("/v1/enquiries", {
      method: "GET",
      params,
    });
  };

  const getAdminEnquiryList = async (params: TEnquiryFilterParams) => {
    return await useAPI("/v1/admin/enquiries", {
      method: "GET",
      params,
    });
  };

  const computePayment = async (payload: any) => {
    const {data, error} = await useAPI(`/v1/payment/compute`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if(data.value){
      const dataVal = data.value as any;
      return dataVal?.data?.results
    } 
    
    if(error.value){
      return Promise.reject(error.value?.data)
    }
  };

  const createOffer = async () => {};


function statusDetails(status: string) {
  let color = "";
  let statusName = ""
  switch (status) {
    case "NEW":
      color = "green";
      statusName = 'New Enquiry'
      break;
    case "BOOKING_CONFIRMED":
      color = "blue";
      statusName = 'Booking Confirmed'
      break;
    case "CUSTOM_OFFER_SENT":
      color = "purple";
      statusName = 'With Custom Offer'
      break;
    case "COMMISION_DUE":
      color = "lime-darken-1";
      statusName = 'Commission Due'
      break;
    case "ARCHIVED":
      color = "black";
      statusName = 'Archived'
      break;
    case "CANCELLED":
      color = "brown";
      statusName = 'Cancelled'
      break;
    case "IN_PROGRESS":
      color = "orange";
      statusName = 'In Progress'
      break;
    case "HAPPENED":
      color = "green-darken-4";
      statusName = 'Happened'
      break;
    case "DECLINED":
      color = "red";
      statusName = 'Declined Offer'
      break;
    case "PAYMENT_FAILED":
      color = "red-darken-4";
      statusName = 'Payment Failed'
      break;
    case "PAYMENT_IN_PROGRESS":
      color = "red-darken-3";
      statusName = 'Payment in progress'
      break;
    case "OFFER_ACCEPTED":
      color = "teal";
      statusName = 'Offer Accepted'
      break;
    case "BOOKING_REQUESTED":
      color = "teal";
      statusName = 'Booking Request Sent'
      break;
    case "BOOKING_REQUEST_WITHDRAWN":
      color = "red-lighten-3";
      statusName = 'Booking Request Withdrawn'
      break;
    case "BOOKING_REQUEST_DECLINED":
      color = "red-accent-1";
      statusName = 'Booking Request Declined'
      break;
    default:
      color = "black";
      break;
  }

  return { color, statusName };
}

  return {
    enquiry,
    offer,
    drawer,
    getEnquiry,
    enquiries,
    mode,
    getEnquiryList,
    getAdminEnquiryList,
    computePayment,
    createOffer,
    updateEnquiry,
    statusDetails,
    activeTab,
    eventType,
    date,
    guests,
    statusFilter,
    showSearchInput,
    searchText,
    currentPage,
    eventDetails
  };
}
