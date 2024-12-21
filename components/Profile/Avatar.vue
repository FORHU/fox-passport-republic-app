<template>
  <v-avatar :size="size" class="custom-avatar">
    <v-img
      class="rounded-pill"
      :src="
        imgSrc && imgSrc !== ''
          ? imgSrc
          : `https://ui-avatars.com/api/?background=373941&color=ffffff&name=${computedName}`
      "
    ></v-img>
  </v-avatar>
</template>

<script setup lang="ts">
const props = defineProps<{
  size?: string;
  imgSrc?: string;
  first_name?: string;
  last_name?: string;
}>();

const computedName = computed(() => {
  return `${props.first_name || ''} ${props.last_name || ''}`.replace(/ /g, "+");
});
</script>

<style scoped>
.custom-avatar {
  background-color: #373941;
}
</style>
