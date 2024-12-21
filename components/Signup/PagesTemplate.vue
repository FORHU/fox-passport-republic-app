<template>
  <v-row no-gutters class="fill-height" style="min-height: 80dvh">
    <v-col
      cols="6"
      class="d-none d-md-block default-gradient pa-10"
      style="position: relative"
    >
      <NuxtLink
        @click="useRouter().back()"
        class="text-decoration-none text-white text-subtitle-2 cursor-pointer"
        style="position: absolute"
        ><span><v-icon icon="mdi-arrow-left mr-2"></v-icon></span>Back</NuxtLink
      >
      <slot name="image"></slot>
    </v-col>
    <v-col
      class="pa-3 pa-lg-10 custom-light-bg-linear d-flex flex-column ga-5 justify-center align-center"
    >
      <slot name="form"></slot>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const { country } = useLocal();
</script>

<style scoped>
.custom-bg-linear {
  background: linear-gradient(180deg, #8091af 0%, #424242 130%);
}

.custom-light-bg-linear {
  background: linear-gradient(
    240.36deg,
    #ffffff 13.7%,
    #ced5e0 48.89%,
    #8091af 150%
  );
}
</style>
