<template>
   <v-row no-gutters class="d-flex ga-2 flex-wrap">
    <template v-for="item in 4" :key="item">
    <v-skeleton-loader class="ma-6" max-width="300" type="card, paragraph" ></v-skeleton-loader>
   </template>
   </v-row>
</template>

<script setup lang="ts">

</script>

<style scoped></style>