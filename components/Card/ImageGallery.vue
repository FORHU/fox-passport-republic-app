<template>
    <div no-gutters class="w-100 my-5 picture-grid" style="position: relative">
        <div class="grid-box my-2" v-for="x, index in photosArr.slice(0, sliceCount) as TFile[]" :key="x._id">
            <div class="picture-grid w-100 h-100 cursor-pointer" style="position: relative;"
                @click="handleFullScreen(x._id)">
                <v-img v-if="x.contentType.includes('image')" :src="x.path" :lazy-src="'/images/placeholder.png'" cover width="100%"
                    height="200" :alt="'space-card-image-' + index">
                    <template v-slot:placeholder>
                        <v-row align="center" class="fill-height ma-0" justify="center">
                            <v-progress-circular color="grey-lighten-5" indeterminate></v-progress-circular>
                        </v-row>
                    </template>
                </v-img>

                <div v-if="x.contentType.includes('video')">
                    <video width="100%" height="100%" cover controls style="object-fit: cover">
                        <source :src="x.path" />
                    </video>
                </div>
                <span v-if="photosArr.length > sliceCount" class="h-100 w-100 d-flex justify-end align-end pa-1"
                    style="position: absolute">
                    <v-btn v-if="photosArrCount - 1 == index" @click.stop="showAll">
                        <v-img class="mr-2" src="/public/dot.svg" height="20px" width="20px"  :alt="'space-card-image-' + index"/>
                        see all {{ photosArr.length || 0 }} photos
                    </v-btn>
                </span>
            </div>

        </div>
    </div>
    <CarouselImageViewer v-model:show="showImageCarousel" :images="photosArr" :active-image-id="activeImageId" />
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify';

const { width } = useDisplay();

const props = defineProps({
    photosArr: {
        type: Array,
        required: true
    },

})


const activeImageId = ref('');
const showImageCarousel = ref(false);


const sliceCount = ref(4)

const photosArrCount = computed(() => {
    const arr = props.photosArr
    if (arr && arr.length > 0) {
        return arr.slice(0, sliceCount.value)?.length;
    } else return 0;

})

watchEffect(() => {
    if (width.value < 550) {
        sliceCount.value = 2
    }
    else if (width.value < 750) {
        sliceCount.value = 4
    } else if (width.value < 1140) {
        sliceCount.value = 3
    } else if (width.value > 1140 && width.value < 1270) {
        sliceCount.value = 4;
    } else if (width.value > 1270 && width.value < 1440) {
        sliceCount.value = 3;
    } else {
        sliceCount.value = 4;
    }
})


const handleFullScreen = (imageId: string) => {
    if (!imageId) return;
    activeImageId.value = imageId;
    showImageCarousel.value = true;
};

const showAll = () => {
    activeImageId.value = props.photosArr[0]?._id;
    showImageCarousel.value = true;
}

</script>

<style scoped>
.picture-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    justify-items: space-around;
    grid-gap: 10px;
    grid-row-gap: 0px;
}

.grid-box {
    width: 100%;
}
</style>