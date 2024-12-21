export function usePricingValidation() {
  const { space, timesFrom } = useSpace();
  // const showTimeError = useState('showTimeError', (): number[] | [] => []);
  // const showOverlapError = useState('showOverlapError', (): number[] | [] => []);

  const checkTimeError = (
    argType: TCustomPricingType,
    duration: string | null,
    timeFromValue: string,
    timeToValue: string,
  ) => {
    if (!duration) return false;

    const pricingArray = space.value.pricing.custom_price?.prices;
    if (pricingArray && pricingArray.length > 0) {
      const matchedArray = pricingArray.filter(
        (item) => item.duration == duration && item.type == argType,
      );

      if (matchedArray.length > 0) {
        // time end should not be more than 13:00
        if (duration == "Per morning") {
          const keyTo =
            timeToValue == "06:00"
              ? 49
              : timesFrom.find((item) => item.value == timeToValue)?.key;
          if (Number(keyTo) > 15) return true;
          return false;
        } else if (duration == "Per afternoon") {
          // should be between 11:00 to 19:00
          const keyFrom = timesFrom.find(
            (item) => item.value == timeFromValue,
          )?.key;
          const keyTo =
            timeToValue == "06:00"
              ? 49
              : timesFrom.find((item) => item.value == timeToValue)?.key;
          if (Number(keyFrom) < 11 || Number(keyTo) > 27) return true;
          return false;
        } else if (duration == "Per evening") {
          // should be minimum of 17:00
          const keyFrom = timesFrom.find(
            (item) => item.value == timeFromValue,
          )?.key;

          if (Number(keyFrom) < 23) return true;
          return false;
        } else return false;
      } else return false;
    } else return false;
  };

  //    const checkOverlapError = (argType: string, weekdays: string[], duration: string | null,  timeFromValue: string, timeToValue: string ) => {
  //     if(!duration) return false;
  //             const pricingArray = space.value.pricing.custom_price?.prices
  //     if(!pricingArray || pricingArray.length == 0) return false;
  //             // filter matching duration, type
  //             const filteredOverlapArray = pricingArray.filter(item => item.type == argType && item.duration == duration)

  //             //filter overlapping hours
  //             const keyFrom = timesFrom.find( item => item.value == timeFromValue)?.key
  //             const keyTo =  (timeToValue == '06:00') ? 49 : timesFrom.find( item => item.value == timeToValue)?.key
  //             const filteredOverlapHoursArray = filteredOverlapArray.filter(item => {
  //                 const timeFromItem = item.time.from
  //                 const timeToItem = item.time.to
  //                 const itemKeyFrom = timesFrom.find( item => item.value == timeFromItem)?.key
  //                 const itemKeyTo = (timeToValue == '06:00') ? 49 : timesFrom.find( item => item.value == timeToItem)?.key
  //                 if(itemKeyFrom && keyFrom && itemKeyTo && keyTo) {
  //                 return (keyFrom < itemKeyTo && keyTo > itemKeyFrom) || (itemKeyFrom < keyTo && itemKeyTo > keyFrom)
  //                 }
  //             })
  //             console.log(filteredOverlapHoursArray);
  //             // find overlapping day
  //             if(filteredOverlapHoursArray.length > 1) {
  //                     const foundOverlap = filteredOverlapHoursArray.some((item, index) => {
  //                 for (let i = index + 1; i < filteredOverlapHoursArray.length; i++){
  //                     if(hasCommonElement(item.weekdays, filteredOverlapHoursArray[i].weekdays)){
  //                         return true
  //                     } else return false;
  //                 }})
  //                 return foundOverlap;

  //                 } else return false;

  //    }

  type TPricesObject = {
    price: null | number;
    package_per_person?: null | number;
    minimum_spend?: null | number;
    duration: null | string;
    time: { from: string; to: string };
    weekdays: string[] | [];
    type: TCustomPricingType;
  };

  const checkOverlapError = (
    argType: string,
    weekdays: string[],
    duration: string | null,
    timeFromValue: string,
    timeToValue: string,
  ) => {
    const pricingArray = space.value.pricing.custom_price?.prices;
    if (!duration || !pricingArray || pricingArray.length == 0) return false;
    // find index of current object
    const sIndex = pricingArray.findIndex(
      (item) =>
        item.type == argType &&
        item.time.from == timeFromValue &&
        item.time.to == timeToValue &&
        item.weekdays == weekdays,
    );

    //filter overlapping hours
    const keyFrom = timesFrom.find((item) => item.value == timeFromValue)?.key;
    const keyTo =
      timeToValue == "06:00"
        ? 49
        : timesFrom.find((item) => item.value == timeToValue)?.key;

    const isMatched = pricingArray.some((item, index) => {
      const timeFromItem = item.time.from;
      const timeToItem = item.time.to;
      const itemKeyFrom = timesFrom.find(
        (item) => item.value == timeFromItem,
      )?.key;
      const itemKeyTo =
        timeToItem == "06:00"
          ? 49
          : timesFrom.find((item) => item.value == timeToItem)?.key;
      if (
        itemKeyFrom &&
        keyFrom &&
        itemKeyTo &&
        keyTo &&
        index !== sIndex &&
        sIndex !== -1
      ) {
        // Check if it overlaps with another time
        if (
          (keyFrom < itemKeyTo && keyTo > itemKeyFrom) ||
          (itemKeyFrom < keyTo && itemKeyTo > keyFrom)
        ) {
          return hasCommonElement(item.weekdays, weekdays);
        } else return false;
      }
      return false; // if any key is missing
    });

    return isMatched;
  };

  // Helper function to check if two arrays have at least one common element
  const hasCommonElement = (array1: string[], array2: string[]): boolean => {
    return array1.some((item) => array2.includes(item));
  };

  const checkWeekdaysError = (
    argType: TCustomPricingType,
    price: number | null,
    minimum_spend: number | null,
    package_per_person: number | null,
    weekdays: string[],
    duration: string,
  ) => {
    if (argType == "HIRE_FEE_MINIMUM_SPEND") {
      if (price && minimum_spend && duration && weekdays.length == 0) {
        return true;
      } else return false;
    } else if (argType == "HIRE_FEE_PACKAGE_FEE") {
      if (price && package_per_person && duration && weekdays.length == 0) {
        return true;
      } else return false;
    } else {
      if (price && duration && weekdays.length == 0) {
        return true;
      } else return false;
    }
  };

  return {
    checkTimeError,
    checkOverlapError,
    checkWeekdaysError,
  };
}
