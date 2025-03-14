import currencyCodes from "~/data/currency-codes.json";
import currencyDetails from "~/data/currency-details.json";

export default function useLocal() {
  const defaultSnackbar = useState("defaultSnackbar", () => false);
  const defaultSnackbarText = useState("defaultSnackbarText", () => "");
  const defaultSnackbarColor = useState("defaultSnackbarColor", () => "");
  const registeredCountries = useState("registeredCountries", () => [{country_name: 'Singapore', cca2: "SG"}]);

  const cookieDarkMode = useCookie("venue4useDarkmode", { default: () => "false" });
  const isDarkMode = useState("isDarkMode", () => cookieDarkMode.value as any);

  watch(isDarkMode, (newValue) => {
    cookieDarkMode.value = newValue.toString();
  });

  function setSnackbar({ text = "", modal = false, color = "" } = {}) {
    defaultSnackbar.value = modal;
    defaultSnackbarText.value = text;
    defaultSnackbarColor.value = color;
  }

  const country = useCookie("country").value as string; 
  let isDialogAppear = useState("isDialogAppear", () => false);

  //VENUE-SPACE
  const spaceDataStore = useState("spaceDataStore", () => {});
  const spaceSelectedDataStore = useState("spaceSelectedDataStore", () => {});

  function setSpaceData(data: any) {
    spaceDataStore.value = data;
  }
  function addNewSpaceData(data: any) {
    spaceDataStore.value.data.push(data);
  }

  // SPACE FEATURES
  const spaceFeatureData = useState(
    "spaceFeatureData",
    (): TVenueSpace[] => [],
  );

  function updateFeatures(data: any) {
    spaceFeatureData.value.features = data;
  }

  function setSelectedSpace(id: Number) {
    spaceDataStore.value.data.forEach((data) => {
      if (data._id == id) spaceSelectedDataStore.value = data;
    });
  }

  const currentCurrency = (country: string) => {
    const upperCasedCountry = country?.toUpperCase() || "SG";

    const currency = currencyCodes[upperCasedCountry.toString()];
    if (!currency) return;
    const currencyObj = currencyDetails[currency];
    return currencyObj
      ? currencyObj
      : {
          symbol: "",
          name: "",
          symbol_native: "",
          decimal_digits: null,
          rounding: null,
          code: "",
          name_plural: "",
        };
  };

  const getCurrencySymbol = (currencyCode: string) => {
    if (!currencyCode) return;
    const uppercasedCode = currencyCode?.toUpperCase() as any
    const currencyObj = currencyDetails?.[uppercasedCode];
    return currencyObj.symbol ? currencyObj.symbol : "";
  };

  const loadCountries = async () => {
    const { data} = await useAPI('/v1/country-settings')
  if(data && data.value && data.value){
    const res = data.value as any;
    const arrayData =  res?.data 
    if(arrayData.length > 0){
      registeredCountries.value = arrayData.sort((a: any, b:any) =>  a?.country_name.localeCompare(b?.country_name)) as any
    }
    
    
  }
  };

  const defaultCountryImage = useState('defaultCountryImage', () => '')

  const getDefaultCountryImage = async () => {
   if(!Array.isArray(registeredCountries.value))  {
    defaultCountryImage.value = '/background.jpeg'
    return;
   }
   const findCountry = registeredCountries.value?.find((x: any) => x.cca2 == country?.toUpperCase())
   // Set default image based on the found country
   defaultCountryImage.value = findCountry?.photo?.[0]?.path || '/background.jpeg';
   

  }


  return {
    defaultSnackbar,
    defaultSnackbarText,
    defaultSnackbarColor,
    setSnackbar,
    country,
    isDialogAppear,
    spaceDataStore,
    setSpaceData,
    addNewSpaceData,
    spaceSelectedDataStore,
    setSelectedSpace,
    updateFeatures,
    currentCurrency,
    getCurrencySymbol,
    registeredCountries,
    loadCountries,
    getDefaultCountryImage,
    defaultCountryImage,
    isDarkMode
  };
}
