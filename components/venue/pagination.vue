<template>
  <v-row no-gutters>
    <v-col cols="12" class="d-flex justify-space-between">
      <v-btn
        style="background-color: #38854f; color: white"
        @click="$router.go(-1)"
        >Back</v-btn
      >
      <v-btn
        style="background-color: #38854f; color: white"
        @click="$router.go(-1)"
        >Next</v-btn
      >
    </v-col>
  </v-row>
</template>

<script>
export default {
  setup() {
    return {};
  },
};
</script>

<style></style>
