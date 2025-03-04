<template>
  <v-row no-gutters class="fill-height" style="min-height: 80dvh">
    <v-col
      cols="6"
      class="d-none d-md-block default-gradient pa-10"
      style="position: relative"
    >
      <NuxtLink
        :to="{ name: 'country-login', params: { country } }"
        class="text-decoration-none text-white text-subtitle-2"
        style="position: absolute"
        ><span><v-icon icon="mdi-arrow-left mr-2"></v-icon></span>Back to Login
        Option</NuxtLink
      >

      <v-row
        no-gutters
        class="fill-height"
        align-content="center"
        justify="center"
      >
        <v-col cols="10" align="center" justify="center">
          <v-col class="text-caption text-white mt-2 text-center">{{
            data.description
          }}</v-col>
          <v-img :src="data.image" cover width="auto" height="270" alt="Page Template Image"></v-img>
          <v-row no-gutters class="w-100 text-white">
            <v-col cols="12" class="text-subtitle-2 mt-2 text-center">{{
              data.addnalQuestion
            }}</v-col>
            <v-col cols="12" class="w-100 d-flex justify-center">
              <NuxtLink :to="data.addnalLink" class="text-white">{{
                data.addnalLinkText
              }}</NuxtLink>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
    <v-col
      class="custom-light-bg-linear d-flex flex-column ga-5 justify-center align-center"
    >
      <slot />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: {
    description: string;
    image: string;
    addnalQuestion: string;
    addnalLink: any;
    addnalLinkText: string;
  };
}>();
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
