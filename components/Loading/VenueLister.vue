<template>
  <v-container class="d-flex flex-column ga-2">
    <template v-for="item in 10" :key="item">
      <v-card elevation="0" :border="'sm'">
        <v-skeleton-loader type="list-item-two-line"> </v-skeleton-loader>
      </v-card>
    </template>
  </v-container>
</template>

<script setup lang="ts"></script>

<style scoped></style>
