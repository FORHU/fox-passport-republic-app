<template>
    <v-row no-gutters class="d-flex align-center ga-3 flex-nowrap">
        <div>
            <v-img :src="featuredImage(space)" :height="mdAndUp ? '80px' : '60px'" :width="mdAndUp ? '80px' : '60px'" cover rounded="lg" :alt="space?.name + '-featured-image'"></v-img>
        </div>
        <div class="pl-3">
            <v-row class="font-500 text-16px text-hover text-secondary">{{
                enquiry?.type }}</v-row>
            <v-row class="text-16px text-hover hover-underlined text-secondary" @click="goToSpace">{{
                maxLettersTruncate ? sliceContent(space?.name, maxLettersTruncate) : space?.name }}</v-row>
            <v-row class="text-16px text-charcoal">
                <span class="">{{ maxLettersTruncate ? sliceContent(space?.venue?.name as string, maxLettersTruncate) : space?.venue?.name }}</span>
            </v-row>

        </div>
    </v-row>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp, lgAndUp } = useDisplay();

const { featuredImage, space, getSpace } = useSpace();
const { country } = useLocal();

const props = defineProps<({
    space: TVenueSpace,
    enquiry: TEnquiry,
    maxLettersTruncate?: number

})>();

const goToSpace = () => {
  const spaceId = props.enquiry?.space?._id as string;
  if (spaceId) {
    navigateTo({
      name: "country-venues-venue",
      params: { country, venue: spaceId },
    });
  }
};

const sliceContent = (content: string, max?: number) => {
  const maxNum = max || 30
  if(content.length > maxNum){
    return content.slice(0, maxNum) + '...';
  } else return content;
}

</script>

<style scoped></style>