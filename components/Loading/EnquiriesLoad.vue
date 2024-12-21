<template>
  <v-container fluid>
    <v-row no-gutters class="hidden-md-and-down">
      <v-col v-for="n in 4" :key="n" class="mr-3">
        <v-skeleton-loader
          class="mt-3"
          type="image, article"
        ></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row class="hidden-lg" no-gutters>
      <v-col class="mr-3">
        <v-skeleton-loader
          class="mt-3"
          type="image, article"
        ></v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>
</template>
