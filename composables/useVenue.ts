import MVenue from "~/models/venue.model";

export function useVenue() {
  const venues = useState("venues", (): TVenue[] => []);
  const venue = useState("venue", (): TVenue => new MVenue());
  const venueCount = useState("venueCount", () => { });
  const drawer = useState("drawer", (): boolean => false);
  const viewMode = useState("viewMode", (): 'table' | 'grid' => 'table')
  const status = useState("status", (): string | null => null);
  const activePage = useState("activePage", (): number | null => null);
  const activeSpacePage = useState("activeSpacePage", (): number => 1);

  const mode = useCookie<"create" | "update" | "delete" | "view">("mode", {
    default: () => "create",
    watch: true,
  });
  const activeStatus = useState("status", () => "");

  const getVenue = async (venueId: string) => {
    return await useAPI(`/v1/venue/`, {
      method: "GET",
      params: {
        venue_id: venueId,
      },
    });
  };

  const getVenueList = async (status: string, page: number, limit: number, venue_name: string | null) => {
    const params: Record<string, any> = {
      page,
      limit,
    };
    if (status) {
      params.status = status;
    }
    if (venue_name) {
      params.venue_name = venue_name;
    }

    return await useAPI("/v1/venue", {
      method: "GET",
      params,
    });
  };

  const getAdminVenueList = async (
    status: string,
    page: number,
    limit: number,
    venue_name: string | null
  ) => {
    const params: Record<string, any> = {
      page,
      limit,
    };
    if (status) {
      params.status = status;

      if(status === 'All') {
        params.status = 'ALL'
      }
    }
    if (venue_name) {
      params.venue_name = venue_name;
    }
    return await useAPI("/v1/admin/venue", {
      method: "GET",
      params,
    });
  };

  const updateVenue = async (venueId: string, payload: Partial<TVenue>) => {
    return await useAPI(`/v1/venue/${venueId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  };

  const adminDeleteVenue = async (venueId: string) => {
    return await useAPI(`/v1/admin/venue/${venueId}`, {
      method: "DELETE",
    });
  };

  const deleteVenue = async (venueId: string) => {
    const { data, error } = await useAPI(`/v1/venue/${venueId}`, {
      method: 'DELETE'
    });
    if (error.value) {
      throw new Error(error.value?.data?.code as any)
    } return data as any;
  };

  // PERMANENT DELETE, USED FOR DRAFTS
  const deleteMultipleVenues = async (venue_ids: string[]) => {
    return await useAPI('/v1/venue', {
      method: "DELETE",
      body: JSON.stringify({ venue_ids })
    });
  };

  const addNewVenue = async (payload: Partial<TVenue>) => {
    return await useAPI("/v1/venue", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const uploadFile = async (formData: FormData) => {
    return await useAPI(`/v1/files`, {
      method: "POST",
      body: formData,
    });
  };

  const adminUpdateVenue = async (
    venueId: string,
    payload: { status: string },
  ) => {
    return await useAPI(`/v1/admin/venue/${venueId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  };

  const getVenueCount = async () => {
    return await useAPI(`/v1/venue/count`, {
      method: "GET",
    });
  };
  const getAdminVenueCount = async () => {
    return await useAPI(`/v1/admin/venue/count`, {
      method: "GET",
      params: {
        excluded_status: "INPROGRESS",
      },
    });
  };

  const fetchVenues = async (params: any) => {
    const queryString = new URLSearchParams({...params, fully_verified: true}).toString();
    return await useAPI(`v1/space/?${queryString}`, {
      method: "GET",
    });
  };

  const getAllVenueList = async (status: string) => {
    let query = {};
    if (status) {
      query.status = status;
    }

    return await useAPI('/v1/venue/venue-list', {
      query: { status }
    })
  }
  // CANCELLATION POLICY VALIDATION FOR CUSTOM CANCELLATION
  const showCustomValidationDays = ref(false);
  const showCustomValidationRates = ref(false);

  watchEffect(() => {
    const policyObj = venue.value?.cancellation_policy?.policy;
    const daysAtLeast = policyObj?.custom.days_at_least?.number_of_days || null;
    const priceAtLeast = policyObj?.custom.days_at_least?.total_price == 0 ? 0 : policyObj?.custom.days_at_least?.total_price || null;

    if(!policyObj) return;
    
    const arr =
      venue.value.cancellation_policy.policy?.custom
        ?.days_less_than_but_at_least || [];
    const daysLessThan =
      policyObj?.custom?.days_less_than?.number_of_days || null;
    const priceLessThan =
      policyObj?.custom?.days_less_than?.total_price == 0 ? 0 : policyObj?.custom?.days_less_than?.total_price || null;

    if (
      policyObj.cancellation_range == "CUSTOM" &&
      daysAtLeast &&
      daysLessThan &&
      priceAtLeast !== null &&
      priceLessThan !== null
    ) {
      // validation for days
      if (!daysAtLeast || !daysLessThan || daysAtLeast < daysLessThan) {
        showCustomValidationDays.value = true;
      } else if (
        arr.length == 2 &&
        (daysAtLeast <= arr[0].days_at_least ||
          arr[0].days_at_least <= arr[1].days_at_least)
      ) {
        showCustomValidationDays.value = true;
      } else if (
        arr.length == 3 &&
        (daysAtLeast <= arr[0].days_at_least ||
          arr[0].days_at_least <= arr[1].days_at_least ||
          arr[1].days_at_least <= arr[2].days_at_least)
      ) {
        showCustomValidationDays.value = true;
      } else showCustomValidationDays.value = false;

      // validation for rates
      if (priceAtLeast == null || priceLessThan == null || priceAtLeast >= priceLessThan) {
        showCustomValidationRates.value = true;
      } else if (
        arr.length == 1 &&
        (priceAtLeast >= arr[0].total_price ||
          arr[0].total_price >= priceLessThan)
      ) {
        showCustomValidationRates.value = true;
      } else if (
        arr.length == 2 &&
        (priceAtLeast >= arr[0].total_price ||
          arr[0].total_price >= arr[1].total_price ||
          arr[1].total_price >= priceLessThan)
      ) {
        showCustomValidationRates.value = true;
      } else if (
        arr.length == 3 &&
        (priceAtLeast >= arr[0].total_price ||
          arr[0].total_price >= arr[1].total_price ||
          arr[1].total_price >= arr[2].total_price ||
          arr[2].total_price >= priceLessThan)
      ) {
        showCustomValidationRates.value = true;
      } else showCustomValidationRates.value = false;
    } else {
      showCustomValidationDays.value = false;
      showCustomValidationRates.value = false;
    }
  });

  const isSubscriptionBased = computed(() => {
    return venue.value.payment_method == 'SUBSCRIPTION';
  })


  const statusList = [
    {
      label: "All",
      value: null,
      color: ''
    },
    {
      label: "Published",
      value: "PUBLISHED",
      color: "published"
    },
    {
      label: "For Approval",
      value: "FOR_APPROVAL",
      color: "for_approval"
    },
    {
      label: "Draft",
      value: "DRAFT",
      color: "draft"
    },
    {
      label: "In Progress",
      value: "INPROGRESS",
      color: "inprogress"
    },
    {
      label: "Suspended",
      value: "SUSPENDED",
      color: "suspended"
    },
    {
      label: "Rejected",
      value: "REJECTED",
      color: "rejected"
    },
    {
      label: "For Closing of Open Transactions",
      value: "FOR_TRANSACTION_CLOSING",
      color: "violet"
    },
    {
      label: "For Deletion",
      value: "FOR_DELETION",
      color: "for_deletion"
    },
    {
      label: "Space For Deletion",
      value: "SPACE_FOR_DELETION",
      color: "teal"
    },
    {
      label: "Archived",
      value: "DELETED",
      color: "archived"
    },
    {
      label: "Pending",
      value: "PENDING",
      color: "light-blue-lighten-4"
    },
    {
      label: "Owner Requires Consent",
      value: "REQUIRES_CONSENT",
      color: "amber"
    },
    {
      label: "Owner Declined",
      value: "OWNER_DECLINED",
      color: "red-darken-4"
    },
    {
      label: "Owner Request Deletion",
      value: "OWNER_REQUEST_DELETION",
      color: ""
    },
    {
      label: "Request Transfer Sent",
      value: "REQUEST_TRANSFER_SENT",
      color: "orange-lighten-4"
    },
  ]


  const isVenuePartOfVenueWithConsent = (status: string) => {
    const validStatuses = ['OWNER_REQUEST_DELETION', 'REQUIRES_CONSENT', 'PENDING', 'OWNER_DECLINED', 'REQUEST_TRANSFER_SENT'];
    return validStatuses.includes(status);
  };

  const isVenuePartOfSalesViewOnly = (status: string) => {
    const validStatuses = ['REQUIRES_CONSENT', 'REQUEST_TRANSFER_SENT'];
    return validStatuses.includes(status);
  };

  const approvalOwnerConsent = async ({ email, venueId }: { email: string, venueId: string }) => {
    const { data, error } = await useAPI(`/v1/admin/venue/transfer-ownership/invite/${venueId}`, {
      method: 'POST',
      body: JSON.stringify({ email })
    })

    if (data.value) {
      return data.value
    }
    if (error.value) {
      return Promise.reject(error.value?.data);
    }
  }


  const resendOwnerTransferEmail = async (venueId: string) => {
    const { data, error } = await useAPI(`/v1/admin/venue/transfer-ownership/invite/resend/${venueId}`, {
      method: 'POST'
    })

    if (data.value) {
      return data.value
    }
    if (error.value) {
      return Promise.reject(error.value?.data);
    }
  }

  const saveOwnerTransfer = async (payload: TSaveMember, token: string) => {
    const { data, error } = await useAPI(`v1/venue/transfer-ownership/accept/${token}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (data.value) {
      return data.value
    }
    if (error.value) {
      return Promise.reject(error.value?.data)
    }
  };

  const existingVenueOwnerTransfer = async (token: string) => {
    const { data, error } = await useAPI(`v1/venue/transfer-ownership/accept/existing/${token}`, {
      method: "POST",
    });

    if (data.value) {
      return data.value
    }
    if (error.value) {
      return Promise.reject(error.value?.data)
    }
  };


const batchUploadExcelFile = async (formData: FormData) => {
  const {data, error} =  await useAPI(`/v1/admin/upload-excel`, {
    method: "POST",
    body: formData,
  });

  if(data.value){
    return data.value
  } 
  if(error.value){
    return Promise.reject(error.value?.data)
  }
};



  return {
    venues,
    venue,
    mode,
    activeStatus,
    venueCount,
    drawer,
    viewMode,
    status,
    activePage,
    activeSpacePage,
    getVenueList,
    getAllVenueList,
    getAdminVenueList,
    updateVenue,
    deleteVenue,
    deleteMultipleVenues,
    adminDeleteVenue,
    addNewVenue,
    uploadFile,
    getVenue,
    adminUpdateVenue,
    getVenueCount,
    getAdminVenueCount,
    fetchVenues,
    showCustomValidationDays,
    showCustomValidationRates,
    isSubscriptionBased,
    statusList,
    approvalOwnerConsent,
    saveOwnerTransfer,
    isVenuePartOfVenueWithConsent,
    isVenuePartOfSalesViewOnly,
    batchUploadExcelFile,
    resendOwnerTransferEmail,
    existingVenueOwnerTransfer
  };
}

