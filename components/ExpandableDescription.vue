<template>
  <v-col cols="12">
    <v-card variant="text">
      <p class="" style="word-break: break-word">
        {{ isExpanded ? description : truncateDescription(description) }}
      </p>
    </v-card>
    <v-row v-if="showReadMoreButton">
      <div
        @click.prevent="toggleDescription"
        class="text-black d-flex align-center my-3"
        style="cursor: pointer"
      >
        <span class="ml-3 text-decoration-underline">{{
          isExpanded ? "Show Less" : "Read More"
        }}</span>
        <v-icon
          :icon="isExpanded ? 'mdi-arrow-up' : 'mdi-arrow-right'"
          class="ml-2"
          size="20"
        ></v-icon>
      </div>
    </v-row>

    <v-row class="hidden-lg-and-up">
      <slot></slot>
    </v-row>
  </v-col>
</template>

<script setup>

const props = defineProps({
  description: {
    type: String,
    required: true,
  },
});

const isExpanded = ref(false);
const maxChar = ref(150);

const toggleDescription = () => {
  isExpanded.value = !isExpanded.value;
};

const truncateDescription = (text) => {
  const words = text.split(" ");

  if (words.length <= maxChar.value) {
    return text
  }
  return words.slice(0, maxChar.value).join(" ") + " ...";
};

const showReadMoreButton = computed(() => {
  const words = props.description?.split(" ");
  return words.length > maxChar.value
})
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
