<template>
  <v-avatar :size="size" class="custom-avatar" :class="withBorder ? 'withBorderCss' : ''">
    <v-img
      class="rounded-pill"
      alt="Avatar Image"
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
  withBorder?: boolean;
}>();

const computedName = computed(() => {
  return `${props.first_name || ''} ${props.last_name || ''}`.replace(/ /g, "+");
});
</script>

<style scoped>
.custom-avatar {
  background-color: #373941;
}

.withBorderCss {
  border: 3px solid #8091AF
}
</style>
