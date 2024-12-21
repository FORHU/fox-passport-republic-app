<template>
  <v-app>
    <LayoutPrimaryHeader />
    <v-navigation-drawer v-model="adminDrawer" class="pa-4">
      <v-list class="pa-0">
        <template v-for="itemType in items" :key="itemType.type">
          <v-list-item
            :to="{
              name: `settings-${itemType.type}`,
            }"
          >
            <v-list-item-title>{{ itemType.title }}</v-list-item-title>
          </v-list-item>
          <v-divider
            v-if="itemType.title === 'Supported Countries'"
          ></v-divider>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
const { adminDrawer } = useUtils();
const items = [
  {
    title: "Supported Countries",
    type: "country",
  },
];
</script>
