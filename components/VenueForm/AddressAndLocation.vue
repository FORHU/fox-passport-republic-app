<template>

  <!-- ADMIN MEMBER COUNTRY INPUT -->
  <v-row v-if="isAdminMember || isAdminSales || isAdmin" no-gutters class="w-100 mt-5">
    <v-col cols="12">
      <span class="w-100 text-18px font-500">Country</span>
      <v-select v-model="venue.address.country" class="mt-1" item-value="cca2" item-title="country_name"
        :items="registeredCountries" name="country" rounded="lg" color="charcoal" base-color="charcoal"
        :rules="countryRules" height="44" @update:model-value="handleChangeCountry" />
    </v-col>
  </v-row>
  <!-- ADMIN MEMBER COUNTRY INPUT -->

  <v-row v-else no-gutters class="w-100 text-18px">Country:&nbsp;&nbsp;
    <span class="font-500">{{ displayedCountry }}</span>
    <span class="ml-1">
      <v-tooltip location="end" class="pa-0 ma-0" open-on-click>
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" icon="mdi-information-variant-circle-outline" size="20"></v-icon>
        </template>
        <template v-slot:default="{ isActive }">
          <v-row no-gutters>
            <v-alert v-bind="isActive" density="compact" max-width="300px"
              text="The provided country was selected during the registration process on Venue4use. If this information is incorrect, please contact support@venue4use.com."
              type="info" border-color="info" elevation="2" color="white"></v-alert>
          </v-row>
        </template>
      </v-tooltip>
    </span>
  </v-row>


  <v-row no-gutters class="w-100 mt-5">
    <v-col cols="12">
      <span class="w-100 text-18px font-500">Street Address</span>
      <v-text-field v-model="venue.address.street" class="mt-1" name="street_address" rounded="lg" color="charcoal"
        base-color="charcoal" :rules="streetRules" height="44" />
    </v-col>
  </v-row>
  <v-row class="my-0 py-0">
    <v-col cols="12" sm="6" md="4">
      <span class="text-18px font-500">City</span>
      <v-text-field v-model="venue.address.city" name="city" :rules="cityRules" class="mt-1" rounded="lg"
        color="charcoal" base-color="charcoal" height="44"></v-text-field>
    </v-col>
    <v-col cols="12" sm="6" md="4">
      <span cols="12" class="text-18px font-500">State</span>
      <v-text-field name="state" v-model="venue.address.state" :rules="stateRules" class="mt-1" rounded="lg"
        color="charcoal" base-color="charcoal" height="44"></v-text-field>
    </v-col>
    <v-col cols="12" md="4">
      <span cols="12" class="text-18px font-500">Postal Code/Zip Code</span>
      <v-text-field name="zip_code" v-model="venue.address.postal_code" :rules="postalCodeRules" class="mt-1"
        rounded="lg" color="charcoal" base-color="charcoal" height="44"></v-text-field>
    </v-col>
    <v-row no-gutters class="mb-3 px-5">
      <AlertSimpleText v-if="addressInvalid" :text="addressErrorMessage" />
    </v-row>
  </v-row>

  <div style="width: 100%" :key="venue.address?.country + venue.address?.city" class="">
    <!-- <iframe
        width="100%"
        height="300"
        frameborder="0"
        scrolling="no"
        marginheight="0"
        marginwidth="0"
        :src="`https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=${completeAddress}+()&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed`"
      >
        <a href="https://www.gps.ie/">gps systems</a>
      </iframe> -->
    <v-col cols="12" style="height: 400px">
      <MapGoogleMap :country="venue.address.country.toUpperCase()" :coordinates="[
        {
          lat: venue.address.coordinates.latitude,
          lng: venue.address.coordinates.longitude,
        },
      ]" :show-details="false" />
    </v-col>
  </div>
</template>

<script setup lang="ts">
const { mode } = useVenue();
const { country, setSnackbar, loadCountries, registeredCountries } = useLocal();
const { currentUser } = useLocalAuth();
const showCountryInfo = ref(false);
const { isAdminMember, isAdmin, isAdminSales } = useAccess();

const venue = defineModel<TVenue>({ required: true });
const addressInvalid = ref(false);

const completeAddress = computed(() => {
  const x = venue?.value?.address;
  const add = `${x?.street} ${x?.city} ${x?.state} ${x?.postal_code}`;
  return encodeURIComponent(add);
});

const emit = defineEmits<{
  (e: "save-draft"): void;
}>();

const countryRules = [(v: string) => !!v || "Country is required"];
const streetRules = [(v: string) => !!v || "Street Address is required"];
const cityRules = [(v: string) => !!v || "City is required"];
const stateRules = [(v: string) => !!v || "State is required"];
const postalCodeRules = [
  (v: string) => !!v || "Postal Code / Zip Code is required",
];

const config = useRuntimeConfig();

let timeoutId: ReturnType<typeof setTimeout>;

watch(
  completeAddress,
  (newVal) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      getCoordinates(newVal);
    }, 500); // Adjust the delay as needed (1000ms = 1s)
  },
  { immediate: true },
);

const handleChangeCountry = () => {
  getCoordinates(completeAddress.value)
}

async function getCoordinates(address: string) {
  const { address: InputAddress } = venue.value;
  if (
    InputAddress?.country == "" ||
    InputAddress?.city == "" ||
    InputAddress?.state == "" ||
    InputAddress?.postal_code == "" ||
    InputAddress?.street == ""
  )
    return;
  const formattedAddress = address.replace(/%20/g, "+");


  try {
    const { data: addressData, error } = await useFetch('/address-details', {
      query: { address: formattedAddress }
    })

    const res = addressData.value as any;

    const data = res?.data

    if (data?.results[0]?.geometry.location) {
      const { lat, lng } = data.results[0].geometry.location;
      if (venue.value.address) {
        venue.value.address.coordinates = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        };
      } else {
        setDefaultCoordinates();
      }
    } else {
      setDefaultCoordinates();
      addressInvalid.value = true;
    }

    if (data?.results[0]?.address_components) {
      const addressComponents = data.results[0].address_components;
      const obj = addressComponents.find((item) =>
        item.types.includes("country"),
      );
      if (obj && obj.short_name) {
        addressInvalid.value =
          obj.short_name !== venue.value.address.country.toUpperCase();
      } else {
        addressInvalid.value = true;
      }
    }
  } catch (error) {
    console.error("Error:", error);
    setDefaultCoordinates();
    // setSnackbar({
    //     color: "error",
    //     text: "Google API Key Issue!",
    //     modal: true,
    //   });
  }
}

function setDefaultCoordinates() {
  if (venue.value.address) {
    venue.value.address.coordinates = { latitude: 0, longitude: 0 };
  }
}

const isVenueOwner = computed(() => {
  return currentUser.value.role == "VENUE_OWNER";
});

const addressErrorMessage = computed(() => {
  return `Please enter a valid ${displayedCountry.value} address`;
});

onMounted(async () => {
  await loadCountries()
  if (venue.value.address && venue.value.address.country == "") {
    if (isVenueOwner.value && !venue.value.address.country) {
      venue.value.address.country =
        currentUser.value.country?.toLocaleUpperCase() ||
        country?.toUpperCase();
      // assign the registered country first
    } else if (isAdminMember && venue.value.address.country == "") {
      venue.value.address.country = country.toUpperCase();
    }
  }
});

const displayedCountry = computed(() => {
  if (!venue.value.address || !venue.value.address.country) return;
  const obj = registeredCountries.value.find(
    (x) => x.cca2 == venue.value.address?.country,
  );
  return obj?.country_name || "";
});
</script>

<style scoped></style>
