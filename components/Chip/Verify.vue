<template>
    <v-chip class="text-error" :prepend-icon="isVerified ? 'mdi-check-circle' : 'mdi-clock-time-nine'" size="small"
        :class="isVerified ? 'text-success' : 'text-error'"
        :text="isVerified ? `${verifiedText || 'Completed'}` : `${pendingText || 'Pending'}`"></v-chip>
</template>

<script setup lang="ts">

const props = defineProps<({
    isVerified?: boolean
    verifiedText?: string
    pendingText?: string
})>()

</script>

<style scoped></style>