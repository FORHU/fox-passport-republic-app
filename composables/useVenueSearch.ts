import { useDisplay } from "vuetify";

export function useVenueSearch() {
  const { mobile, smAndDown } = useDisplay();
  const router = useRouter();
  const { timeOptionFrom, timeOptionTo, tags } = useVenueData();
  const { categories, location, total_guest, date } = useRoute().query;
  const { venueCount, fetchVenues } = useVenue();
  const { guestFilter } = useSpaceData();
  const { loadCountries, registeredCountries, country, setSnackbar } =
    useLocal();
  const { loggedIn } = useLocalAuth();
  const { getGroupOfFavorites, deselectFavorites } = useFavorites();

  const snackbar = useState("snackbar", () => true);
  const showingMethod = useState("showingMethod", () => "List");
  const favoriteCount = useState("favoriteCount", () => 0);
  const favoriteObj = useState("favoriteObj", () => undefined);
  const showGuestFilter = useState("showGuestFilter", () => false);
  const priceValue = useState("priceValue", () => ["0", "0"]);
  const showMoreFilterDialog = useState("showMoreFilterDialog", () => false);
  const mobileMap = useState("mobileMap", () => false);
  const isGuestMenuOpen = useState("isGuestMenuOpen", () => false);
  const isDateMenuOpen = useState("isDateMenuOpen", () => false);
  const isPriceMenuOpen = useState("isPriceMenuOpen", () => false);
  const priceReset = useState("priceReset", () => false);
  const ageRestriction = useState("ageRestriction", () => false);
  const cancellationFlexibility = useState(
    "cancellationFlexibility",
    () => false
  );
  const loader = useState("loader", () => false);
  const page = useState("page", () => 1);
  const totalPages = useState("totalPages", () => 1);
  const activeGuest = useState("activeGuest", () => "");
  const selectedKeysRepresentation = reactive(new Set<string>());
  const date_calendar = useState("date_calendar", () => null);
  const filterDateFrom = useState("filterDateFrom", () => null);
  const filterDateTo = useState("filterDateTo", () => null);
  const venues = useState("venues", () => [] as TVenueSpace[]);
  const foodAndBeverages = useState("foodAndBeverages", () => []);
  const menuOffer = useState("menuOffer", () => []);
  const facilities = useState("facilities", () => []);
  const allowedEvents = useState("allowedEvents", () => []);
  const parkingAccommodation = useState("parkingAccommodation", () => []);
  const accessibility = useState("accessibility", () => []);
  const coordinates = useState("coordinates", () => [] as object[]);
  const currentPage = useState("currentPage", () => null);
  const totalItems = useState("totalItems", () => null);
  const numGuest = useState("numGuest", (): number | null => null);
  const eventType = useState("eventType", () => categories);
  const venueLocation = useState("venueLocation", (): null | string => null);

  //Fetching venues from the landing page search
  onMounted(async () => {
    // run only in search page
    if (!useRoute().path?.includes("/search")) return;

    loader.value = true;
    await loadCountries();
    await loadInitialData();
    loader.value = false;

    if (numGuest.value === 0 && mobile.value === false) {
      isGuestMenuOpen.value = true;
    }
    if (date) {
      const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (ddmmyyyyRegex.test(date)) {
        const [, day, month, year] = date.match(ddmmyyyyRegex)!;
        const formattedDate = `${year}-${month}-${day}`;
        date_calendar.value = new Date(formattedDate);
      } else {
        date_calendar.value = new Date(date);
      }
    }
  });

  //Filtering the area type of venues from the child component
  const updateSelectedKeys = (newKeys: Set<string>) => {
    selectedKeysRepresentation.clear();
    newKeys.forEach((key) => selectedKeysRepresentation.add(key));
  };

  const selectedKeysString = computed(() =>
    Array.from(selectedKeysRepresentation).join(", ")
  );

  const selectedKeysFoodAndBev = computed(() =>
    Array.from(foodAndBeverages.value).join(",")
  );

  const selectedKeysMenuOffer = computed(() =>
    Array.from(menuOffer.value).join(",")
  );

  const selectedKeysFacilities = computed(() =>
    Array.from(facilities.value).join(",")
  );

  const selectedKeysAllowedEvents = computed(() =>
    Array.from(allowedEvents.value).join(",")
  );

  const selectedKeysParkingAccommodation = computed(() =>
    Array.from(parkingAccommodation.value).join(",")
  );

  const selectedKeysAccessibility = computed(() =>
    Array.from(accessibility.value).join(",")
  );

  const updateObjectFilter = (value: any) => {
    if (value.type === "age") {
      ageRestriction.value = value.value;
    } else if (value.type === "cancel") {
      cancellationFlexibility.value = value.value;
    } else if (value.type === "f&b") {
      foodAndBeverages.value = value.value;
    } else if (value.type === "menu") {
      menuOffer.value = value.value;
    } else if (value.type === "facilities") {
      facilities.value = value.value;
    } else if (value.type === "events") {
      allowedEvents.value = value.value;
    } else if (value.type === "parking") {
      parkingAccommodation.value = value.value;
    } else if (value.type === "accessibility") {
      accessibility.value = value.value;
    } else if (value.type === "clear") {
      menuOffer.value = [];
      facilities.value = [];
      allowedEvents.value = [];
      parkingAccommodation.value = [];
      accessibility.value = [];
      ageRestriction.value = false;
      cancellationFlexibility.value = false;
      activeGuest.value = "";

      priceValue.value[0] = "0";
      priceValue.value[1] = "0";
      filterDateFrom.value = null;
      filterDateTo.value = null;
      if (smAndDown.value) {
        date_calendar.value = null;
        numGuest.value = 0;
      }
    }
    debouncedSearchVenues();
  };

  //Fetching the venues function
  const searchVenues = async () => {
    // run only in search page
    if (!useRoute().path?.includes("/search")) return;

    loader.value = true;
    const params: any = {
      page: page.value,
      keywords: eventType.value,
      total_guest: numGuest.value,
      location: venueLocation.value,
      status: "PUBLISHED",
      limit: 12,
      age_restriction: ageRestriction.value,
      cancellation_flexibility: cancellationFlexibility.value,
    };

    if (filterDateFrom.value !== null) {
      params.start_time = filterDateFrom.value;
    }

    if (filterDateTo.value !== null) {
      params.end_time =
        filterDateTo.value.length !== 5
          ? filterDateTo.value.split(" ")[0]
          : filterDateTo.value;
    }

    if (date !== null) {
      params.start_date = formatDate(date);
    }

    if (selectedKeysString.value !== "") {
      params.representation = selectedKeysString.value;
    }

    if (selectedKeysFoodAndBev.value !== "") {
      params.foods_and_beverages = selectedKeysFoodAndBev.value;
    }

    if (selectedKeysMenuOffer.value !== "") {
      params.menu_offer = selectedKeysMenuOffer.value;
    }

    if (selectedKeysFacilities.value !== "") {
      params.facilities = selectedKeysFacilities.value;
    }

    if (selectedKeysAllowedEvents.value !== "") {
      params.allow_events = selectedKeysAllowedEvents.value;
    }

    if (selectedKeysParkingAccommodation.value !== "") {
      params.parking_and_accommodation = selectedKeysParkingAccommodation.value;
    }

    if (selectedKeysAccessibility.value !== "") {
      params.accessibility_features = selectedKeysAccessibility.value;
    }

    if (date_calendar.value !== null) {
      let selectedDate = new Date(date_calendar.value);
      selectedDate.setMinutes(
        selectedDate.getMinutes() - selectedDate.getTimezoneOffset()
      );
      params.start_date = selectedDate.toISOString().substring(0, 10);
    }
    if (priceValue.value[0] !== "0" || priceValue.value[1] !== "0") {
      params.min_price = isNaN(parseInt(priceValue.value[0]))
        ? 0
        : parseInt(priceValue.value[0]);
      params.max_price = isNaN(parseInt(priceValue.value[1]))
        ? 0
        : parseInt(priceValue.value[1]);
    }
    if (activeGuest.value !== "") {
      params.capacity_layout = activeGuest.value;
    }

    const { data }: { data: any } = await fetchVenues(params);
    if (data) {
      venues.value = data.value.data.data;
      currentPage.value = data.value.data.current_page;
      totalItems.value = data.value.data.total_items;
      totalPages.value = data.value.data.total_pages;
      venueCount.value = data.value.data.total_items;
      venueCount.value = (venues.value as any).length;
      getCoordinates();
    }
    loader.value = false;
  };
  //Clearing the filter function
  const clearFilter = (type: string): void => {
    if (type === "guest") {
      activeGuest.value = "";
      numGuest.value = 0;
      searchVenues();
    } else if (type === "price") {
      priceReset.value = true;
      priceValue.value[0] = "0";
      priceValue.value[1] = "0";
      searchVenues();
    } else if (type === "date") {
      date_calendar.value = null;
      filterDateFrom.value = null;
      filterDateTo.value = null;
      searchVenues();
    }
  };

  function debounce(fn: any, delay: any) {
    let timeoutID: any;
    return function (...args: any) {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
      timeoutID = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  }
  const debouncedSearchVenues = debounce(searchVenues, 1000);

  // watch(priceValue, (oldValue, newValue) => {
  //   if (oldValue !== newValue) {
  //     setTimeout(() => {
  //       debouncedSearchVenues();
  //     }, 1000);
  //   }
  // }, {immediate: false});

  // watch(eventType, (oldValue, newwVal) => {
  //   if (oldValue) {
  //     searchVenues();
  //   }
  // }, {immediate: false});

  // watch(venueLocation, (oldValue, newwVal) => {
  //   if (oldValue) {
  //     searchVenues();
  //   }
  // });

  // watch(
  //   () => priceValue.value[0],
  //   (newValue, oldValue) => {
  //     if (oldValue !== newValue) {
  //       setTimeout(() => {
  //         debouncedSearchVenues();
  //       }, 1000);
  //     }
  //   } , {immediate: false}
  // );

  // watch(
  //   () => priceValue.value[1],
  //   (newValue, oldValue) => {
  //     if (oldValue !== newValue) {
  //       setTimeout(() => {
  //         debouncedSearchVenues();
  //       }, 1000);
  //     }
  //   } , {immediate: false}
  // );

  // watch(numGuest, (oldValue, newValue) => {
  //   if (oldValue !== newValue) {
  //     setTimeout(() => {
  //       debouncedSearchVenues();
  //     }, 500);
  //   }
  // } , {immediate: false});

  // watch(date_calendar, (oldValue, newwVal) => {
  //   if (oldValue) {
  //     searchVenues();
  //   }
  // } , {immediate: false});

  watch(
    filterDateFrom,
    (newFilterDateFrom) => {
      if (newFilterDateFrom) {
        filterDateTo.value = null;
      }
    },
    { immediate: false }
  );

  watch(
    [filterDateFrom, filterDateTo],
    ([newFilterDateFrom, newFilterDateTo]) => {
      if (newFilterDateFrom && newFilterDateTo) {
        searchVenues();
      }
    },
    { immediate: false }
  );

  const setActiveCard = (option: string): void => {
    activeGuest.value = option;
    searchVenues();
  };

  const guestModel = computed({
    get() {
      return numGuest.value === 0 ? "" : numGuest.value;
    },
    set(value) {
      numGuest.value = value === "" ? 0 : value;
    },
  });

  const getCoordinates = (spacesArray: TVenueSpace[]) => {
    if (!spacesArray) return [];
    coordinates.value = spacesArray.reduce((acc: object[], item: any) => {
      if (item?.venue?.address && item?.venue?.address?.coordinates) {
        const prices = item?.pricing?.custom_price?.prices?.map((price) => ({
          price: price?.price,
          duration: price?.duration,
        }));

        acc.push({
          lat: parseFloat(item?.venue?.address?.coordinates?.latitude),
          lng: parseFloat(item?.venue?.address?.coordinates?.longitude),
          location: `${item.venue.address.street}, ${item?.venue?.address?.city}`,
          title: item?.venue.name,
          photo: item?.space_photo,
          rating: item?.rating?.averageRating,
          currency: item?.pricing?.currency,
          price: prices?.[0]?.price,
          duration: prices?.[0]?.duration,
          id: item._id,
        });
      }
      return acc;
    }, []);
  };

  const filteredTimeOptions = computed(() => {
    const fromIndex = timeOptionTo.indexOf(filterDateFrom.value);
    const newTimeOptionTo = timeOptionTo.slice(fromIndex + 1);
    const result = newTimeOptionTo.reduce(
      (accumulator: string[], currentValue) => {
        const [fromHours, fromMinutes] = filterDateFrom.value
          .split(":")
          .map(Number);

        const [toHours, toMinutes] = currentValue.split(":").map(Number);

        const fromDate: any = new Date();
        fromDate.setHours(fromHours, fromMinutes, 0, 0);

        const toDate: any = new Date();
        toDate.setHours(toHours, toMinutes, 0, 0);

        let diffMs = toDate - fromDate;
        if (diffMs < 0) {
          diffMs += 24 * 60 * 60 * 1000;
        }
        let diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours === 0) diffHours = 24;
        accumulator.push(`${currentValue} (${diffHours} hrs)`);
        return accumulator;
      },
      []
    );
    return result;
  });

  const formatDate = (date: any) => {
    const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    if (ddmmyyyyRegex.test(date)) {
      const [, day, month, year] = date.match(ddmmyyyyRegex);
      const formattedDate = `${year}-${month}-${day}`;
      return new Date(formattedDate).toISOString().substring(0, 10); // Returns date in yyyy-mm-dd format
    }
    return new Date(date).toISOString().substring(0, 10); // If the date doesn't match the pattern, return null
  };

  const loadInitialData = async () => {
    venueLocation.value = location?.toUpperCase();
    numGuest.value = parseInt(total_guest);

    const params = {
      keywords: categories,
      total_guest: total_guest,
      location: venueLocation.value,
      status: "PUBLISHED",
      limit: 12,
    };

    if (date !== null) {
      const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (ddmmyyyyRegex.test(date)) {
        const [, day, month, year] = date.match(ddmmyyyyRegex)!;
        const formattedDate = `${year}-${month}-${day}`;
        params.start_date = new Date(formattedDate)
          .toISOString()
          .substring(0, 10);
      } else {
        params.start_date = new Date(date).toISOString().substring(0, 10);
      }
    }

    const { data }: { data: any } = await fetchVenues(params);
    if (data) {
      venues.value = data.value.data.data;
      currentPage.value = data.value.data.current_page;
      totalItems.value = data.value.data.total_items;
      totalPages.value = data.value.data.total_pages;
      venueCount.value = data.value.data.total_items;
      getCoordinates(venues.value);
    }
    await getFavoriteCount();
  };

  const getFavoriteCount = async () => {
    if (!loggedIn.value) return;
    const { data }: { data: any } = await getGroupOfFavorites();

    if (data.value.results.length == 0) {
      favoriteCount.value = 0;
    }
    if (data.value.results.length > 0) {
      favoriteObj.value = data.value.results;
      favoriteCount.value = data.value.results.length;
    }
  };
  const formattedDate = computed(() => formattedDateToDisplay(true));

  const formattedButtonDate = computed(() => formattedDateToDisplay(false));

  const formattedDateToDisplay = (condition: boolean) => {
    if (!date_calendar.value && condition === false) return "Date";
    const date = new Date(date_calendar.value);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = days[date.getDay()];
    return condition
      ? `${dayName}, ${day}/${month}/${year}`
      : `${day}/${month}/${year}`;
  };

  const getImage = (spaces: any) => {
    const images = spaces.filter((file: any) =>
      file.contentType.startsWith("image/")
    );
    return images.length ? images[0].path : "/images/venue/sample_venue.jpg";
  };

  const tagsItems = computed(() => {
    const flattenedKeywords = Object.values(tags).flatMap((category) =>
      category.flatMap((item) => item.keywords)
    );

    const sortedKeywords = flattenedKeywords
      .slice()
      .sort((a, b) => a.localeCompare(b));

    return sortedKeywords;
  });

  const imageSrc = (venueId: string): string => {
    const venue = venues.value.find((obj) => obj._id === venueId);
    if (!venue) return "";

    const imageExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".bmp",
      ".svg",
      ".webp",
    ];
    const imageObj = venue.space_photo.find((image) => {
      const extension = image.path
        .substring(image.path.lastIndexOf("."))
        .toLowerCase();
      return imageExtensions.includes(extension);
    });

    return imageObj?.path || "";
  };

  const navigateTo = (route: any) => {
    router.push(route);
  };

  function changeShowMethod() {
    if (showingMethod.value == "List") {
      showingMethod.value = "Map";
      mobileMap.value = true;
      return;
    } else {
      showingMethod.value = "List";
      mobileMap.value = false;
      return;
    }
  }

  watch(smAndDown, (oldValue, newVal) => {
    if (newVal) {
      mobileMap.value = false;
    }
  });

  watch(
    page,
    async () => {
      await searchVenues();
    },
    { immediate: false }
  );

  watch(mobileMap, (newValue, oldValue) => {
    if (newValue == false && showingMethod.value != "List") {
      changeShowMethod();
    }
  });

  async function folderCreated() {
    await loadInitialData();
    await getFavoriteCount();
  }

  async function deselectFavorite(val) {
    const favoriteId = val;

    await deselectFavorites(favoriteId as string).then(() => {
      setSnackbar({
        color: "success",
        text: "Removed from your favorites list",
        modal: true,
      });
    });
    await loadInitialData();
    await getFavoriteCount();
  }

  return {
    snackbar,
    showingMethod,
    router,
    timeOptionFrom,
    timeOptionTo,
    tags,
    categories,
    location,
    total_guest,
    date,
    venueCount,
    fetchVenues,
    guestFilter,
    registeredCountries,
    country,
    setSnackbar,
    loggedIn,
    favoriteCount,
    favoriteObj,
    getGroupOfFavorites,
    deselectFavorites,
    showGuestFilter,
    priceValue,
    showMoreFilterDialog,
    mobileMap,
    isGuestMenuOpen,
    isDateMenuOpen,
    isPriceMenuOpen,
    priceReset,
    ageRestriction,
    cancellationFlexibility,
    loader,
    page,
    totalPages,
    activeGuest,
    selectedKeysRepresentation,
    date_calendar,
    filterDateFrom,
    filterDateTo,
    venues,
    foodAndBeverages,
    menuOffer,
    facilities,
    allowedEvents,
    parkingAccommodation,
    accessibility,
    coordinates,
    currentPage,
    totalItems,
    numGuest,
    eventType,
    venueLocation,
    updateSelectedKeys,
    selectedKeysString,
    selectedKeysFoodAndBev,
    selectedKeysMenuOffer,
    selectedKeysFacilities,
    selectedKeysAllowedEvents,
    selectedKeysParkingAccommodation,
    selectedKeysAccessibility,
    updateObjectFilter,
    searchVenues,
    clearFilter,
    setActiveCard,
    guestModel,
    getCoordinates,
    filteredTimeOptions,
    loadInitialData,
    getFavoriteCount,
    formattedDate,
    formattedButtonDate,
    formattedDateToDisplay,
    getImage,
    tagsItems,
    imageSrc,
    navigateTo,
    changeShowMethod,
    folderCreated,
    deselectFavorite,
    debouncedSearchVenues,
  };
}
