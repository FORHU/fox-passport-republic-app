// It will be available as useFoo() (camelCase of file name without extension)
export default function () {
  function validEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) || "Invalid email address";
  }

  function minPasswordLength(password: string) {
    return (
      (password && password.length >= 6) ||
      "Password must be at least 6 characters"
    );
  }

  function requiredInput(input: string) {
    return !!input || "This field is required.";
  }
  function requiredInputForName(input: string): string | boolean {
  const regex = /^[A-Za-zÀ-ÿ\s]+$/; // Allow letters and spaces only
  if (!input) {
    return "This field is required.";
  }
  if (!regex.test(input)) {
    return "Only letters and spaces are allowed.";
  }
  return true; // Input is valid
}

  function requiredNumber(input: number) {
    return !isNaN(input) || "The input must be a number.";
  }

  function requiredGreaterThanZero(input: number) {
    return input > 0 || 'The input must be greater than zero.';
  }

  function requiredInteger(input: number) {
    return Number.isInteger(input) || 'The input must be a whole number.';
  }

  function formatNumberIntoString(value: number, withDecimal = true) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: withDecimal ? 2 : 0,
    });
  }

  function calculateDateRange(
    startDate: string | number | Date,
    months: number
  ) {
    startDate = new Date(startDate);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1 + months,
      startDate.getDate()
    );

    // Format the dates for output
    const startMonth = startDate.toLocaleString("default", { month: "short" });
    const endMonth = endDate.toLocaleString("default", { month: "short" });

    const startDateString =
      startMonth + " " + startDate.getDate() + ", " + startDate.getFullYear();
    const endDateString =
      endMonth + " " + endDate.getDate() + ", " + endDate.getFullYear();

    return {
      formatted: "Start " + startDateString + " - Ends " + endDateString,
      raw: {
        start: startDate,
        end: endDate,
      },
    };
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString();
  }

  // converts 13:00  to 01:00PM
  function convertTimeToAMPM(timeString: string | null) {
    if(!timeString) return;
    const [hours, minutes] = timeString?.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const formattedTime = `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    return formattedTime;
  }

  // 2024-08-08T07:37:50.245Z' to AM/PM format
  function convertISOtoLocaleAMPM(dateTimeString: string | null) {
    if(!dateTimeString) return;
    const date = new Date(dateTimeString);
    const options = {hour: "numeric", minute: "numeric", hour12: true };
    const formattedDateTime = date.toLocaleString("en-US", options as any);
    return formattedDateTime;
  }


  // Friday, May 31, 2024
  function longDateFormat(dateString: string): string {
    if (!dateString) return "";
    const parts = dateString.split("/");
    const date = new Date(
      Number(parts[2]),
      Number(parts[1]) - 1,
      Number(parts[0])
    ); // Month is zero-based
    const options = {
      // weekday: "short", //WITHOUT weekday
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", options as any);
    return formattedDate;
  }

    // use for chat time distance
    function convertToTimeDistance(dateTimeString: string | null) {
      if(!dateTimeString) return;
      const date = new Date(dateTimeString);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for today

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of the week
      
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // End of the week

    //   const options = {
    //     weekday: "long",
    //     year: "numeric",
    //     month: "long",
    //     day: "numeric",
    // };

      if (date.toDateString() === today.toDateString()) {
        const todayOptions = {hour: "numeric", minute: "numeric", hour12: true };
        return date.toLocaleString("en-US", todayOptions as any);
      } else if (date >= startOfWeek && date <= endOfWeek) {
        const options = {weekday: "short" };
        return date.toLocaleDateString("en-US", options as any);
      } else {
        const monthDayYearOptions = { month: "short", day: "numeric" };
        return date.toLocaleDateString("en-US", monthDayYearOptions as any);
      }
    }



  function timeStampDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const optionsDate = { day: "2-digit", month: "2-digit", year: "numeric" };
    const formattedDate = date
      .toLocaleDateString("en-US", optionsDate as any)
      .replace(/\//g, "-");

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    // Determine if AM or PM
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedTime = `${hours}:${minutes} ${ampm}`;
 

    return `${isToday ? '' :  formattedDate} ${formattedTime}`;
  }

  function formatAddress(address?: Partial<TVenueAddress>) {
    if (!address) return "No address available";
  
    const {
      street = "",
      city = "",
      country = "",
      state = "",
      postal_code = "",
    } = address;
  
    const parts = [street, city, state, country];
    let formattedAddress = parts.filter((part) => part !== "").join(", ");
  
    if (postal_code) {
      formattedAddress += ` ${postal_code}`;
    }
    return formattedAddress;
  }
  const { statusList } = useVenue();

  const formatStatus = (status: string) => {
    if(!status) return
    const obj = statusList.find(x => x.value == status)
    return (obj && obj?.label) ? obj?.label : ''

  };

  const formatColor = (status: string) => {
    if(!status) return ''
    const obj = statusList.find(x => x.value == status)
    return (obj && obj?.color) ? obj?.color : ''
  
  };

  const adminDrawer = useState("adminDrawer", (): boolean => true);

  function maskContactNumbers(message: string) {
    function isMonetaryValue(str: string) {
      // Regex for identifying monetary values with commas and optional decimals
      return /^(?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})?$/.test(str);
    }

    function maskDigitsExceptMonetary(str: string) {
      return str
        .split(" ")
        .map((segment) => {
          if (isMonetaryValue(segment)) {
            return segment;
          }
          return segment.replace(/\d/g, "*");
        })
        .join(" ");
    }
    return maskDigitsExceptMonetary(message);
  }

  const phoneRegex =
    /\+?\d{6,}|\(?([0-9]{3})\)?([ .-]?)([0-9]{3,})([ .-]?)([0-9]{4})/;

  const displayHeader = useState("displayHeader", () => false);

  const sliceContent = (content: string, max?: number) => {
    if(!content) return;
    const maxNum = max || 30
    if(content.length > maxNum){
      return content.slice(0, maxNum) + '...';
    } else return content;
  }

  // will convert to percentage with max 2 decimal places
  function convertToPercentage (val: number) {
    if (val === null || val === undefined || isNaN(val)) return null;
      const num = val * 100
      return parseFloat(num.toFixed(2))
  }
  
   // will convert to decimal with max 4 decimal places 0.
  function convertToDecimal (val: number) {
    if (val === null || val === undefined || isNaN(val)) return null;
      const num = val/100
      return parseFloat(num.toFixed(4))
  }

  function capitalizeNames(name: string): string {
    return name
      .split(' ') // Split the name into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
      .join(' '); // Join the words back together
  }

  const formatPricingType = (type: string) => {
    if(!type) return;
    const lowercaseType = type.toLowerCase().replace(" ", "");
    return lowercaseType.replace("per", "/");
  };

  const timeAgo = (dateString: string, includeAgo: boolean = true): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
    const suffix = includeAgo ? " ago" : "";
  
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds > 1 ? "s" : ""}${suffix}`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""}${suffix}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""}${suffix}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""}${suffix}`;
    } else if (diffInSeconds < 2419200) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} week${weeks > 1 ? "s" : ""}${suffix}`;
    } else if (diffInSeconds < 29030400) {
      const months = Math.floor(diffInSeconds / 2419200);
      return `${months} month${months > 1 ? "s" : ""}${suffix}`;
    } else {
      const years = Math.floor(diffInSeconds / 29030400);
      return `${years} year${years > 1 ? "s" : ""}${suffix}`;
    }
  };

  return {
    validEmail,
    minPasswordLength,
    requiredInput,
    requiredInteger,
    formatNumberIntoString,
    calculateDateRange,
    formatDate,
    longDateFormat,
    timeStampDate,
    convertTimeToAMPM,
    formatAddress,
    formatStatus,
    formatColor,
    adminDrawer,
    maskContactNumbers,
    phoneRegex,
    displayHeader,
    convertISOtoLocaleAMPM,
    convertToTimeDistance,
    sliceContent,
    requiredNumber,
    requiredGreaterThanZero,
    convertToDecimal,
    convertToPercentage,
    requiredInputForName,
    capitalizeNames,
    formatPricingType,
    timeAgo
  };
}
