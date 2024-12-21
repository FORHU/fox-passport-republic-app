<template>
  <v-container fluid class="wrapper">
    <h1>My Account</h1>

    <v-card class="ma-2">
      <div class="d-flex">
        <v-app-bar-nav-icon
          class="hidden-lg-and-up mt-3 ml-2"
          variant="text"
          size="40"
          @click.stop="drawer = !drawer"
        ></v-app-bar-nav-icon>
        <h2 class="pa-3">Reviews</h2>
      </div>
      <v-divider color="#6750A4" :thickness="2"></v-divider>

      <v-card class="pa-5">
        <!-- REVIEWS -->
        <div class="review d-flex flex-wrap">
          <div class="left d-flex">
            <div class="pic mr-5 mb-3">
              <v-avatar
                image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHdLZAJzeEA2iYjsrN4CEXrg8ATQ1tB04blQ&s"
                size="80"
              ></v-avatar>
            </div>
            <div class="text">
              <p>⭐⭐⭐⭐⭐</p>
              <p>John Doe</p>
              <p>06/18/2024</p>
            </div>
          </div>

          <div class="right flex-grow-1 mb-5">
            <p>
              The tour was very well organised. One minus is that you get
              completely bombarded with information. You also have to stand up
              for too long at the private entrance to the Tower of London, which
              leads to a lack of time later. Lunch was the same, too stress, the
              quality was great but you couldn't enjoy it. I'd like to ask the
              organisers: please
            </p>
          </div>
        </div>

        <v-list bg-color="transparent" class="d-flex flex-column-reverse" dense>
          <v-list-item v-for="(rating, i) in 5" :key="i">
            <v-progress-linear
              :model-value="rating * 15"
              class="mx-n5"
              color="yellow darken-3"
              height="20"
              rounded
            ></v-progress-linear>

            <template v-slot:prepend>
              <span>{{ rating }}</span>
              <v-icon class="mx-3" icon="mdi-star"></v-icon>
            </template>

            <template v-slot:append>
              <div class="rating-values">
                <span class="d-flex justify-end">{{ rating * 224 }}</span>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "profile",
});

const { drawer } = useVenue();
</script>

<style scoped>
.wrapper {
  background-color: #e0e8f5;
  min-height: 100vh;
}
</style>
