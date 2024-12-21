<template>
    <v-btn-toggle v-model="viewMode" border="secondary md" :style="{maxHeight}" mandatory>
        <v-btn value="table" :class="viewMode == 'table' ? 'text-secondary' : 'text-grey-lighten-2'"
            icon="mdi-format-list-bulleted">
        </v-btn>
        <v-btn value="grid" icon="mdi-view-grid-outline"
            :class="viewMode == 'grid' ? 'text-secondary' : 'text-grey-lighten-2'">
        </v-btn>
    </v-btn-toggle>
</template>

<script setup lang="ts">

defineProps<({
    maxHeight: string
})>()

const viewMode = defineModel({required: true})

</script>

<style scoped></style>