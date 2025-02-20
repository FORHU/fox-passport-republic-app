<template>
    <v-select v-bind="$attrs" v-model="model" :items="filteredOptions" :dense="dense" :persistent-hint="persistentHint"
        item-title="label"
        item-value="value" :placeholder="placeholder" active :variant="variant || 'plain'" :rules="rules"
        :disabled="disabled" :class="disabled ? 'opacity-20' : ''" no-data-text="No more available slot">
        <template v-slot:item="{ props, item }">
            <v-list-item v-if="item" v-bind="props" :title="`${item.raw?.label}${item.raw.booked ? ' - Booked' : ''}`"
                :disabled="item.raw.props.disabled || item.raw.booked" class="font-600"
                :class="[item.raw.props.disabled ? 'opacity-30' : 'text-secondary', (item.raw.props.disabled && !item.raw.booked) ? 'text-decoration-line-through' : '']">
            </v-list-item>
        </template>

    </v-select>
</template>

<script setup lang="ts">


const props = defineProps<({
    items: bookingTimeArray[] | [],
    rules: (string | boolean)[]
    disabled?: boolean
    placeholder?: string
    persistentHint?: boolean
    dense?: boolean
    variant?: "outlined" | "plain" | "filled" | "underlined" | "solo" | "solo-inverted" | "solo-filled"

})>()

const model = defineModel<any>({ required: true })

const emit = defineEmits([])

// removed disabled time at the start/end of the options
const filteredOptions = computed(() => {
    const array = props.items;
    if (!array) return;

    const firstAvailableKey = array.find(x => x.props.disabled == false || x.booked)?.key as number
    const lastAvailableKey = array.findLast(x => x.props.disabled == false || x.booked)?.key as number;
    if (!firstAvailableKey || !lastAvailableKey) return [];
    return array.filter(x => (x.key >= firstAvailableKey && x.key <= lastAvailableKey))

})


</script>

<style scoped></style>