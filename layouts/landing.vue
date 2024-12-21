<template>
  <v-app>
    <LayoutLandingHeader />

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<style scoped>
.v-main {
  padding-top: 0;
}
</style>
