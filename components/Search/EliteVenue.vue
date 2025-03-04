<template>
  <v-row no-gutters>
    <v-col cols="12">
      <v-row>
        <v-col cols="12" class="text-center text-sm-left">
          <h3 class="headline">discover</h3>
          <h2 class="grey-darken-4 my-5 font-700 text-sm-h5 text-lg-h4 font-weight-bold">
            Top Venues all over Asia
          </h2>
        </v-col>
      </v-row>
    </v-col>

    <v-col cols="12">
      <v-row>
        <v-col
          v-for="(venue, index) in venues"
          :key="index"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            class="venue-card"
            :style="{ backgroundImage: `url(${venue.image})` }"
            height="200px"
            @click="handleChangeCountry(venue?.cca2)"
          >
            <div class="venue-overlay">
              <v-card-title class="text-h6 venue-info">
                <v-row no-gutters>
                  <v-col
                    cols="12"
                    class="d-flex flex-row justify-center align-center"
                  >
                    <span>{{ venue.country }}</span>
                    <v-responsive class="ml-2"
                      ><v-img :src="venue.flag" height="20" :width="20" alt="Flag Icon"></v-img
                    ></v-responsive>
                  </v-col>
                </v-row>
              </v-card-title>
              <!-- <v-card-text class="venue-count venue-info"
                >{{ venue.venueCount }} venues</v-card-text
              > -->
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from "vue";

const venues = ref([
  {
    country: "Singapore",
    flag: "/images/landingpage/flag/singapore.png",
    image: "/images/landingpage/discover-1.png",
    venueCount: "1000+",
    cca2: 'sg'
  },
  {
    country: "Philippines",
    flag: "/images/landingpage/flag/philippines.png",
    image: "/images/landingpage/discover-2.png",
    venueCount: "1000+",
     cca2: 'ph'
  },
  {
    country: "Malaysia",
    flag: "/images/landingpage/flag/malaysia.png",
    image: "/images/landingpage/discover-3.png",
    venueCount: "1000+",
     cca2: 'my'
  },
]);

const handleChangeCountry = async (country_code: string) => {
    useCookie('country').value = country_code.toLocaleLowerCase();
    navigateTo({name: 'country', params: {country: country_code}})
  // reloadNuxtApp({ path: `/${country_code}`})
}
</script>

<style scoped>
.headline {
  color: rgba(var(--v-theme-primary));
  font-family: "DM Sans", sans-serif;
  text-transform: uppercase;
  font-size: 25px;
}
.venue-card {
  background-size: cover;
  background-position: center;
  transition: transform 0.3s;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  padding-top: 100%;
  display: flex;
  align-items: flex-end;
}

.venue-card:hover {
  transform: translateY(-5px);
}

.custom-outlined-btn {
  border-width: 1px !important;
  box-shadow: none !important;
}
.venue-overlay {
  padding: 16px;
  width: 100%;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.reduced-gutters .v-col {
  padding: 0 8px;
}

@media (max-width: 600px) {
  .venue-card {
    padding-top: 75%;
  }
}
</style>
