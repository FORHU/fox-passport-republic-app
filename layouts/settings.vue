<template>
  <v-app>
    <LayoutPrimaryHeader />

    <v-navigation-drawer class="pa-4">
      <v-list class="pa-0">
        <template v-for="itemType in types" :key="itemType.type">
          <v-list-item :to="itemType.to">
            <v-list-item-title>{{ itemType.title }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
const baseUrl = "settings";

const types = computed(() => {
  return [
    {
      title: "Countries",
      to: { name: `${baseUrl}-countries` },
    },
  ];
});
</script>
