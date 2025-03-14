import MSpace from "~/models/space.model";

export function useSpace() {
  const spaces = useState((): TVenueSpace[] => []);
  const space = useState((): TVenueSpace => new MSpace());

  const getSpace = async (spaceId: string) => {
    return await useAPI(`/v1/space/`, {
      method: "GET",
      params: {
        space_id: spaceId,
      },
    });
  };

  
  const getSpaceList = async (venueId: string) => {
    return await useAPI("/v1/space", {
      method: "GET",
      params: {
        venue_id: venueId,
      },
    });
  };

  //used to fetch all spaces without pagination
  const getAllSpacesWithoutPagination = async(venue_id: string) => {
    return await useAPI('/v1/space/space-list', {
      method: "GET",
      query: {
        venue_id,
      },
    });
  }

  const getFilteredSpaceList = async (venue_id: string, status: string | null, page: number, limit: number) => {
    const params: Record<string, any> = {
      page,
      limit,
      venue_id
    };
    if (status) {
      params.status = status;
    }
    return await useAPI("/v1/space", {
      method: "GET",
      params
    });
  };



  // paginated space list used in space management, with total spaces, active spaces
  const getListSpaceManagement = async (query: ISpaceManagementListQuery) => {
    const { data, error } =  await useAPI('/v1/space/subscribed', {
      query: query
  });
 if (error.value){
  const message = error.value?.data?.message || 'Something went wrong. Please try again later.'
  throw new Error(message);
 } return data as any;
  }

  const addNewSpace = async (venueId: string, name: string, status: 'DRAFT' | 'PENDING') => {
    return await useAPI("/v1/space", {
      method: "POST",
      body: JSON.stringify({
        venue_id: venueId,
        name,
        status,
      }),
    });
  };

  const updateSpace = async (
    spaceId: String,
    payload: Partial<TVenueSpace>,
  ) => {
    return await useAPI(`/v1/space/${spaceId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  };

  // NOT WORKING AS OF 8/22/2024
  const deleteSpace = async (spaceId: string) => {
    return await useAPI(`/v1/space/${spaceId}`, {
      method: "DELETE",
    });
  };

  // PERMANENT DELETE, USED FOR DRAFTS
  const deleteMultipleSpaces = async (space_ids: string[]) => {
    return await useAPI('/v1/space', {
      method: "DELETE",
      body: JSON.stringify({space_ids})
    });
  };

  // when triggered, it will check for ongoing transactions/bookings and will turn status to 'DELETED' or 'DELETION'
  const deleteSpaceWithValidation = async (space_id: string) => {
    const { data, error } =  await useAPI(`/v1/space/${space_id}`, {
      method: 'DELETE'
  });
      if (error.value){
        throw new Error(error.value?.data?.code as any)
      } return data as any;

  }

  const adminDeleteSpace = async (spaceId: string) => {
    const {error, data} =  await useAPI(`/v1/admin/space/${spaceId}`, {
      method: "DELETE",
    });

    if (error.value){
      throw new Error(error.value?.data?.message as any)
    } return data as any;
  };

  const adminUpdateSpace = async (
    spaceId: string,
    payload: { status: string },
  ) => {
    return await useAPI(`/v1/admin/space/${spaceId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  };

  
  // val is ISO8601 --> Fri Mar 28 2025 00:00:00 GMT+0800 (Philippine Standard Time)
  const allowedDatesChecker = (pricing: TPricing, val: any) => {
    if (!pricing || !val) return true;
    if (pricing && pricing.selected_pricing == "HIRE_FEE") {
      const daysAllowedArr = pricing?.hire_fee?.days
        ?.filter((x) => x.fullRateCheckkBox || x.hourlyCheckBox)
        .map((item) => item.name);
      // allowed only hourly checkbox for now
      // const daysAllowedArr = pricing?.hire_fee?.days?.filter(x =>  x.hourlyCheckBox).map(item => item.name)

      const dateObj = new Date(val);
      const dayOfWeek = dateObj
        .toLocaleString("en-US", { weekday: "long" })
        .toUpperCase();

      if (daysAllowedArr && dayOfWeek) {
        return daysAllowedArr.includes(dayOfWeek);
      } else {
        return false;
      }
    } else {
      const daysAllowedArr = pricing?.custom_price?.prices?.flatMap((x) =>
        x.weekdays.map((x: string[]) => x),
      );
      const dateObj = new Date(val);
      const dayOfWeek = dateObj
        .toLocaleString("en-US", { weekday: "long" })
        .toUpperCase();

      if (daysAllowedArr && dayOfWeek) {
        return daysAllowedArr.includes(dayOfWeek);
      } else {
        return false;
      }
    }
  };


    // function checker for allowed time slots
    const allowedTime = (
      pricing: TPricing,
      date: any,
      booking: any = [],
      showSecond6AM?: boolean
    ) => {
      if (date === null) return timesFrom;
  
    
      // in YYYY-MM-DD
      function formatLocalDate(date: any) {
        const formatDate = new Date(date)
        const timezoneOffset = formatDate?.getTimezoneOffset() * 60 * 1000;
        const localDate = new Date(formatDate.getTime() - timezoneOffset);
        return localDate.toISOString().split("T")[0];
      }
  
      function getTimeOnly(isoString: any) {
        const date = new Date(isoString);
        const hours = date.getUTCHours().toString().padStart(2, "0");
        const minutes = date.getUTCMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      }
      const dateObj = new Date(date);
      const dayOfWeek = dateObj
        .toLocaleString("en-US", { weekday: "long" })
        .toUpperCase();
  
      let allowedTimesArray = [];
  
      const getTimeKey = (timeValue: string) => {
        return timesFrom.find((t) => t.value == timeValue)?.key;
      };
  
      // map through all booked durations
      const checkIfBooked = (timeKey: number): boolean => {
        return booking.some((item: any) => {
          if (
            item.status == "CONFIRMED" &&
            new Date(item.start_date).toISOString().split("T")[0] ==
              formatLocalDate(date)
          ) {
            // const bookStartTime = parseInt(getTimeOnly(item?.start_date).replace(":", ""));
            // const bookEndTime = parseInt(getTimeOnly(item?.end_date).replace(":", ""));
            const bookedStartKey = getTimeKey(getTimeOnly(item?.start_date));
            const bookedEndKey = getTimeKey(getTimeOnly(item?.end_date));
  
            if (!bookedStartKey || !timeKey || !bookedEndKey) return false;
            return timeKey >= bookedStartKey && timeKey <= bookedEndKey;
          } else return false;
        });
      };
  
      if (pricing.selected_pricing === "HIRE_FEE") {
        const dayPricing = pricing.hire_fee?.days.find(
          (day) => day.name === dayOfWeek
        );
  
        let hourlyStartKey: number | null = null;
        let hourlyEndKey: number | null = null;
        let fullDayStartKey: number | null = null;
        let fullDayEndKey: number | null = null;
  
        if (!dayPricing || !dayPricing?.slots) return;
  
        const { start, end } = dayPricing.slots;
        const startKey = getTimeKey(start) || null;
        const endKey = end == "06:00" ? 49 : getTimeKey(end) || null;
  
        // if(dayPricing && dayPricing?.fullRateCheckkBox && dayPricing?.full_day_start && dayPricing?.full_day_end){
        //   fullDayStartKey = getTimeKey(dayPricing?.full_day_start) || null;
        //   fullDayEndKey = dayPricing?.full_day_end == "06:00" ? 49 : getTimeKey(dayPricing?.full_day_end) || null;
        // }
  
        // // Determine the smallest start key and largest end key
        //   const startKey = Math.min(hourlyStartKey ?? Infinity, fullDayStartKey ?? Infinity);
        //   const endKey = Math.max(hourlyEndKey ?? -Infinity, fullDayEndKey ?? -Infinity );
  
        const isTimeInRange = (time: any, start: any, end: any) => {
          if (time == -1) return false;
          return !(time >= start && time <= end);
        };
  
        allowedTimesArray = timesFrom.map((time: any) => {
          const isBooked = checkIfBooked(time.key);
            return {
              ...time,
              props: {
                ...time.props,
                disabled: isTimeInRange(time.key, startKey, endKey) || isBooked,
              },
              booked: isBooked,
            };
        });
      } else {
        const dayPricings = pricing.custom_price?.prices.filter((item) =>
          item.weekdays.includes(dayOfWeek)
        );
  
        if (!dayPricings || dayPricings.length === 0) {
          return timesFrom.map((time) => {   
          return {
            ...time,
            props: {
              ...time.props,
              disabled: true,
            },
          };
          });
        }
  
        const disabledTimes = timesFrom.map((time) => {
          const isBooked = checkIfBooked(time.key);
  
          const isDisabled = !dayPricings.some((dayPricing) => {
            const { from, to } = dayPricing.time;
            const startKey = getTimeKey(from);
            const endKey = to == "06:00" ? 49 : getTimeKey(to);
            if (!time.key || !startKey || !endKey) return false;
            return time.key >= startKey && time.key <= endKey;
          });
  
          return {
            ...time,
            props: {
              ...time.props,
              disabled: isDisabled || isBooked,
            },
            booked: isBooked,
          };
        });
  
        allowedTimesArray = disabledTimes;
      }
  
      // Check if the selected date is today and the time is in the past
      // Get current time in hours and minutes
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
  
      // Format current date as YYYY-MM-DD
      const selectedDate = formatLocalDate(date); // in YYYY-MM-DD
      const currentDate = now.toISOString().split("T")[0];
  
      // Loop through the allowed times and disable lapsed ones
      allowedTimesArray = allowedTimesArray.map((timeItem) => {
        const [hours, minutes] = timeItem.value.split(":").map(Number);
  
        if (
          selectedDate === currentDate &&
          (hours < currentHour ||
            (hours === currentHour && minutes < currentMinute))
        ) {
          timeItem.props.disabled = true;
        }
  
        return timeItem;
      });
  
      // disable time if before/after times are disabled
      const finalArray = allowedTimesArray.map((time, index) => {
        const currentState = allowedTimesArray[index]?.props?.disabled;
        const previousState = allowedTimesArray[index - 1]?.props?.disabled;
        const nextState = allowedTimesArray[index + 1]?.props?.disabled;
  
        if (index == 0 && nextState == true && currentState == false) {
          time.props.disabled = true;
          return time;
        } else if (
          nextState == true &&
          previousState == true &&
          currentState == false
        ) {
          time.props.disabled = true;
          return time;
        } else {
          return time;
        }
      });
  
      return showSecond6AM ? finalArray : finalArray.filter((x) => x.key !== 49) as bookingTimeArray[];
    };

  const timesFrom: bookingTimeArray[] = [
    { key: 1, label: "06:00am", value: "06:00", props: { disabled: false }, booked: false },
    { key: 2, label: "06:30am", value: "06:30", props: { disabled: false }, booked: false },
    { key: 3, label: "07:00am", value: "07:00", props: { disabled: false }, booked: false },
    { key: 4, label: "07:30am", value: "07:30", props: { disabled: false }, booked: false },
    { key: 5, label: "08:00am", value: "08:00", props: { disabled: false }, booked: false },
    { key: 6, label: "08:30am", value: "08:30", props: { disabled: false }, booked: false },
    { key: 7, label: "09:00am", value: "09:00", props: { disabled: false }, booked: false },
    { key: 8, label: "09:30am", value: "09:30", props: { disabled: false }, booked: false },
    { key: 9, label: "10:00am", value: "10:00", props: { disabled: false }, booked: false },
    { key: 10, label: "10:30am", value: "10:30", props: { disabled: false }, booked: false },
    { key: 11, label: "11:00am", value: "11:00", props: { disabled: false }, booked: false },
    { key: 12, label: "11:30am", value: "11:30", props: { disabled: false }, booked: false },
    { key: 13, label: "12:00pm", value: "12:00", props: { disabled: false }, booked: false },
    { key: 14, label: "12:30pm", value: "12:30", props: { disabled: false }, booked: false },
    { key: 15, label: "01:00pm", value: "13:00", props: { disabled: false }, booked: false },
    { key: 16, label: "01:30pm", value: "13:30", props: { disabled: false }, booked: false },
    { key: 17, label: "02:00pm", value: "14:00", props: { disabled: false }, booked: false },
    { key: 18, label: "02:30pm", value: "14:30", props: { disabled: false }, booked: false },
    { key: 19, label: "03:00pm", value: "15:00", props: { disabled: false }, booked: false },
    { key: 20, label: "03:30pm", value: "15:30", props: { disabled: false }, booked: false },
    { key: 21, label: "04:00pm", value: "16:00", props: { disabled: false }, booked: false },
    { key: 22, label: "04:30pm", value: "16:30", props: { disabled: false }, booked: false },
    { key: 23, label: "05:00pm", value: "17:00", props: { disabled: false }, booked: false },
    { key: 24, label: "05:30pm", value: "17:30", props: { disabled: false }, booked: false },
    { key: 25, label: "06:00pm", value: "18:00", props: { disabled: false }, booked: false },
    { key: 26, label: "06:30pm", value: "18:30", props: { disabled: false }, booked: false },
    { key: 27, label: "07:00pm", value: "19:00", props: { disabled: false }, booked: false },
    { key: 28, label: "07:30pm", value: "19:30", props: { disabled: false }, booked: false },
    { key: 29, label: "08:00pm", value: "20:00", props: { disabled: false }, booked: false },
    { key: 30, label: "08:30pm", value: "20:30", props: { disabled: false }, booked: false },
    { key: 31, label: "09:00pm", value: "21:00", props: { disabled: false }, booked: false },
    { key: 32, label: "09:30pm", value: "21:30", props: { disabled: false }, booked: false },
    { key: 33, label: "10:00pm", value: "22:00", props: { disabled: false }, booked: false },
    { key: 34, label: "10:30pm", value: "22:30", props: { disabled: false }, booked: false },
    { key: 35, label: "11:00pm", value: "23:00", props: { disabled: false }, booked: false },
    { key: 36, label: "11:30pm", value: "23:30", props: { disabled: false }, booked: false },
    { key: 37, label: "12:00am", value: "00:00", props: { disabled: false }, booked: false },
    { key: 38, label: "12:30am", value: "00:30", props: { disabled: false }, booked: false },
    { key: 39, label: "01:00am", value: "01:00", props: { disabled: false }, booked: false },
    { key: 40, label: "01:30am", value: "01:30", props: { disabled: false }, booked: false },
    { key: 41, label: "02:00am", value: "02:00", props: { disabled: false }, booked: false },
    { key: 42, label: "02:30am", value: "02:30", props: { disabled: false }, booked: false },
    { key: 43, label: "03:00am", value: "03:00", props: { disabled: false }, booked: false },
    { key: 44, label: "03:30am", value: "03:30", props: { disabled: false }, booked: false },
    { key: 45, label: "04:00am", value: "04:00", props: { disabled: false }, booked: false },
    { key: 46, label: "04:30am", value: "04:30", props: { disabled: false }, booked: false },
    { key: 47, label: "05:00am", value: "05:00", props: { disabled: false }, booked: false },
    { key: 48, label: "05:30am", value: "05:30", props: { disabled: false }, booked: false },
    { key: 49, label: "06:00am", value: "06:00", props: { disabled: false }, booked: false },
  ];
  const timesTo = ref<any[]>([]);

  const checkTimesToFunction = (
    pricing: TPricing,
    date: any,
    timeFrom: string,
    booking: any
  ) => {
    const startIndex = timesFrom.findIndex((time) => time.value === timeFrom);

    // check if next hour/option is disabled

    // const nextIndex = startIndex + 1

    // const isNextHourDisabled = timesFrom[nextIndex].props.disabled == true
    // if(isNextHourDisabled) return [];

    if (startIndex === -1) return (timesTo.value = []);
    let newTimes = [];
    let counter = 0.5;

    let showSecond6AM = true;
    const allowedTimes: any = allowedTime(
      pricing,
      date,
      booking,
      showSecond6AM
    );

    for (let i = startIndex + 1; i < allowedTimes?.length; i++) {
      newTimes.push({
        key: allowedTimes[i].key,
        label: `${allowedTimes[i].label} (${counter} hrs)`,
        value: allowedTimes[i].value,
        props: allowedTimes[i].props,
        booked: allowedTimes[i].booked,
      });
      counter += 0.5;
    }
    const finalArray = newTimes.map((time, index) => {
      const currentState = newTimes[index]?.props?.disabled;
      const previousState = newTimes[index - 1]?.props?.disabled;
      const nextState = newTimes[index + 1]?.props?.disabled;

      if (previousState == true && currentState == false) {
        time.props.disabled = true;
        return time;
      } else {
        return time;
      }
    });
    return (timesTo.value = finalArray) as bookingTimeArray[]
   
    
  };

  const featuredImage = (space: TVenueSpace) => {
    const arr = space?.space_photo
    if(arr && arr.length > 0) {
      const obj = arr?.find((x: any) => x?.contentType?.includes('image') )
      return obj?.path || null;
    } else return null;
  }


  const getRate = (pricing: any, date_calendar: string | null, priceFilter: [string | null, string | null]| [null, null]) => {
    const selectedPricing = pricing?.selected_pricing;
    const [minPrice, maxPrice]: [string | null, string | null] =
      (priceFilter)
    
      
    // Check for min/max price is in default;
    const isDefaultPriceFilter =  parseInt(maxPrice as string) === 0 || (maxPrice == null && minPrice === null) ;
    let priceArray = []; // displayed price

    if (selectedPricing == "HIRE_FEE") {
      let lowestRate = Infinity;
      let lowestHourlyRate: null | number = null;
      let lowestPerDayRate: null | number = null;
  
      const getLowestRate = (array: any = []) => {
        array.forEach((x: any) => {
          // Check if the current rates are valid
          const currentHourlyRate = x?.slots?.rate;
          const currentFullDayRate = x?.full_day_rate;
  
          if (currentHourlyRate != null && x?.hourlyCheckBox) {
            if (currentHourlyRate < lowestRate) {
              lowestHourlyRate = currentHourlyRate;
              lowestRate = currentHourlyRate;
              lowestPerDayRate =
                currentFullDayRate && x?.fullRateCheckkBox
                  ? currentFullDayRate
                  : null;
            }
          }
  
          if (currentFullDayRate != null && x?.fullRateCheckkBox) {
            if (currentFullDayRate < lowestRate) {
              lowestPerDayRate = currentFullDayRate;
              lowestRate = currentFullDayRate;
              lowestHourlyRate =
                currentHourlyRate && x?.hourlyCheckBox ? currentHourlyRate : null;
            }
          }
        });
  
        if (lowestHourlyRate) {
          priceArray.push({ rate: lowestHourlyRate, type: "/hour" });
        }
        if (lowestPerDayRate) {
          priceArray.push({ rate: lowestPerDayRate, type: "/day" });
        }
      };     

      if (date_calendar) {
        const date = new Date(date_calendar);
        const day = date
          ?.toLocaleString("en-US", { weekday: "long" })
          ?.toUpperCase();
  
        const obj = pricing?.hire_fee?.days?.find(
          (x: any) => x?.name.toUpperCase() == day
        );

        const perDay = obj?.fullRateCheckkBox;
        const hourly = obj?.hourlyCheckBox;
  
        if (hourly) {
          priceArray.push({ rate: obj?.slots?.rate, type: "/hour" });
        }
        if (perDay) {
          priceArray.push({ rate: obj?.full_day_rate, type: "/day" });
        }
      } 
      
      if (priceArray.length == 0) {
        // get prices that matches the price filter
        const allPricesArray = pricing?.hire_fee?.days;
        if (allPricesArray.length > 0) {
          getLowestRate(allPricesArray);
        }
      }
  
      // FOR CUSTOM PRICES
    } else {
      let lowestRate = Infinity;
      let duration = "";
    
      // get lowest rate without comparison on price range
      const getLowestRateWithoutPricesFilter = (array: any = []) => {
        array.forEach((x: any) => {
          if (x?.price < lowestRate) {
            lowestRate = x?.price;
            duration = x?.duration;
          }
        });
        priceArray.push({ rate: lowestRate, duration, type: duration });
      };
  
      // if calendar is defined
      if (date_calendar) {
        const date = new Date(date_calendar);
        const day = date
          ?.toLocaleString("en-US", { weekday: "long" })
          ?.toUpperCase();
  
        // filter prices with similar weekday
        const filterPricesArray = pricing?.custom_price?.prices.filter((x: any) =>
          x.weekdays.includes(day)
        );
        getLowestRateWithoutPricesFilter(filterPricesArray);
      } else {
        // if both calendar is null and filter are with values
        const pricesArray = pricing?.custom_price?.prices;
        getLowestRateWithoutPricesFilter(pricesArray);
      }
    }
    
    if (!isDefaultPriceFilter) {
      let lowestRate = Infinity;
      let duration = "";
    
      // Filter prices and find the lowest rate within the price range
      const filteredArray = priceArray.filter((x: any) => {
        if (
          x?.rate < lowestRate &&
          parseInt(minPrice || '0' as string) <= x.rate &&
          parseInt(maxPrice as string) >= x.rate
        ) {
          lowestRate = x?.rate;
          duration = x?.type;
          return true; // This will include the element in the filtered array
        }
        return false; // This will exclude the element
      });
      
      return filteredArray; // Return the filtered array based on conditions

    } else {
      return priceArray; // Return original array if filter is not applied
    }
    // return priceArray;
  };


  // from and to are in format 07:00 && 12:00 check if the available time is available
  const checkTimeAvailability = ({from, to, arrayToCheck} : {from: string, to: string, arrayToCheck: bookingTimeArray[]}) => {
    let fromKEY = arrayToCheck?.find(x => x.value == from)?.key
    let toKEY = arrayToCheck?.find(x => x.value == to)?.key
    if(!fromKEY || !toKEY) return false;
    
    const start = Math.min(fromKEY, toKEY);
    const end = Math.max(fromKEY, toKEY);

    for (let i = start; i <= end; i++) {
      const timeSlot = arrayToCheck[(i - 1)];
      if (timeSlot.props.disabled) {
        return false; // If any slot is disabled, return false
      }
    }
  
    return true;
    
  }

  return {
    spaces,
    space,
    getSpace,
    getSpaceList,
    getFilteredSpaceList,
    addNewSpace,
    updateSpace,
    deleteSpace,
    adminDeleteSpace,
    adminUpdateSpace,
    allowedDatesChecker,
    timesFrom,
    allowedTime,
    checkTimesToFunction,
    featuredImage,
    deleteMultipleSpaces,
    getAllSpacesWithoutPagination,
    getListSpaceManagement,
    deleteSpaceWithValidation,
    getRate,
    checkTimeAvailability
  };
}
