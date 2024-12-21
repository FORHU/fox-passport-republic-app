<template>
    <v-btn v-if="!noLabel" variant="text" density="comfortable" class="text-16px" prepend-icon="mdi-arrow-left">
        {{ label }}</v-btn>
        <v-btn v-else icon="mdi-arrow-left" flat></v-btn>
</template>

<script setup lang="ts">
defineProps<({
label?: string,
noLabel?:  boolean
})>()

</script>

<style scoped></style>