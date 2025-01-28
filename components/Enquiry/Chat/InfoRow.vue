<template>
    <v-row no-gutters class="text-16px w-100">
      <v-col :cols="labelCols" style="line-height: 1.2;">{{ label }}</v-col>
      <v-col align="end" :style="{ 'line-height': '1.2' }">
        <span v-if="link" @click="emit('link-click')" class="hover-underlined">{{ value }}</span>
        <span v-else>{{ value }}</span>
      </v-col>
    </v-row>
    <v-divider v-if="withBottomDivider" class="my-5"></v-divider>
  </template>
  
  <script setup>
  defineProps({
    label: String,
    value: String || Number || undefined,
    labelCols: {
      type: [String, Number],
      default: 5
    },
    link: Boolean,
    handleClick: Function,
    withBottomDivider: {
      type: Boolean,
      required: false,
      default: false
    }
  });

  const emit = defineEmits(['link-click']);
  </script>
  