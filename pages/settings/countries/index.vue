<template>
  <v-img height="400" src="/about-us-hero.jpeg" cover alt="about us hero">
    <v-row
      no-gutters
      class="fill-height third-gradient"
      align-content="center"
      justify="center"
    >
      <v-row
        class="fill-height pa-4"
        align="end"
        justify="center"
        justify-sm-start
      >
        <v-container>
          <p class="text-white text-h3 text-center text-sm-left">
            Admin Setting
          </p>
        </v-container>
      </v-row>
    </v-row>
  </v-img>

  <v-container class="my-10">
    <v-card class="pa-9" color="cyan-lighten-5">
      <p class="text-h4">List of Countries</p>

      <div
        v-for="(country, index) in countries"
        :key="index"
        class="country-item mt-4"
      >
        <v-row no-gutters class="mt-2 align-center">
          <v-col cols="12" md="2">
            <v-img :src="country.flag" width="50" :alt="'country flag -' + index "></v-img>
          </v-col>

          <v-col cols="12" md="2">
            <h3>{{ country.name }}</h3>
            <p>Country</p>
          </v-col>

          <v-col cols="12" md="2">
            <h3>{{ country.countryCode }}</h3>
            <p>Country Code</p>
          </v-col>

          <v-col cols="12" md="1">
            <h3>{{ country.currencySign }}</h3>
            <p>Currency Sign</p>
          </v-col>

          <v-col cols="12" md="1">
            <h3>{{ country.currencyCode }}</h3>
            <p>Currency Code</p>
          </v-col>

          <v-col cols="12" md="2">
            <h3>{{ country.commissionRate }}</h3>
            <p>Commission Rate</p>
          </v-col>

          <v-col cols="12" md="2" class="text-center hidden-sm-and-down">
            <v-btn
              icon
              flat
              @click="navigateToCountry(country.country)"
              color="cyan-lighten-5"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </v-col>

          <v-col class="text-center hidden-md-and-up mt-5">
            <v-btn
              flat
              block
              @click="navigateToCountry(country.country)"
              color="#8091AF"
            >
              EDIT
            </v-btn>
          </v-col>

          <v-divider class="mt-5 border-opacity-100" color="black"> </v-divider>
        </v-row>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
const router = useRouter();

const countries = [
  {
    name: "Singapore",
    country: "singapore",
    flag: "/svg/sg-flag.svg",
    countryCode: "+65",
    currencySign: "S$",
    currencyCode: "SGD",
    commissionRate: "10%",
  },
  {
    name: "Philippines",
    country: "philippines",
    flag: "/svg/ph-flag.svg",
    countryCode: "+63",
    currencySign: "₱",
    currencyCode: "PHP",
    commissionRate: "10%",
  },
  {
    name: "Malaysia",
    country: "malaysia",
    flag: "/svg/malaysia-flag.svg",
    countryCode: "+60",
    currencySign: "M$",
    currencyCode: "MYR",
    commissionRate: "10%",
  },
];

const navigateToCountry = (country) => {
  router.push(`/settings/countries/${country}`);
};
</script>
