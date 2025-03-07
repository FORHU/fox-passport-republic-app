<template>
    <v-row v-if="objType" no-gutters class="pa-3" align="center">
        <v-col class="d-flex ga-2 align-center">
            <span><v-img :src="objType.imagePath" height="30" width="auto" class="icon" alt="Space Type Image"></v-img></span>
            <div class="ml-2 d-flex flex-column">
                <span class="w-100 font-500 text-16px">{{ objType.name }}</span>
                <span class="w-100 text-14px">{{ objType.subtitle }}</span>
            </div>
        </v-col>
    </v-row>
</template>

<script setup>
const { spaceTypesObj, areaTypeOptions } = useSpaceData();

const props = defineProps({
    spaceType: {
        type: String,
        required: true
    }
});

const objType = computed(() => {
    if(!props.spaceType) return;
    return areaTypeOptions.find(x => x.key == props.spaceType)
})

</script>

<style lang="scss" scoped></style>