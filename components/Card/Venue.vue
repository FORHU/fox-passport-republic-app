<template>
  <v-card
    color="primary"
    variant="outlined"
    :height="mdAndUp ? 310 : 250"
    :width="mdAndUp ? 220 : 170"
    position="relative"
    elevation="3"
    rounded="lg"
    @click="emit('card-click')"
    :border="selected ? 'lg primary' : 'sm primary'"
  >
    <div style="position: relative" :class="addIcon ? 'blurred-card' : ''">
      <v-img
        :height="mdAndUp ? 184 : 130"
        :src="venueData?.imageUrl || '/images/venue/add-function.png'"
        cover
        alt="Venue Card"
      >
      </v-img>
      <v-card-text class="mx-md-1">
        <v-row>
          <v-col>
            <span
              class="text-subtitle-2 text-md-subtitle-1 text-black font-weight-bold text-no-wrap"
              style="line-height: 1; text-overflow: ellipsis"
              >{{ venueData.name }}</span
            >
            <span class="text-subtitle-1 mt-md-1 d-flex align-center">
              <v-badge :color="cardType" inline dot></v-badge>
              <span
                class="ml-1 text-capitalize text-caption"
                :class="`text-${cardType}`"
                >{{ venueData.status }}</span
              >
            </span>
            <span>
              <v-chip
                class="ma-1 text-uppercase text-subtitle-5"
                :class="`bg-${cardType === 'black' ? 'primary' : cardType}`"
                label
                size="x-small"
                @click.stop="emit('edit-click')"
              >
                {{ venueData.buttonLabel }}
              </v-chip>
              <v-chip
                v-if="!addIcon"
                class="mx-1 text-uppercase text-subtitle-5 bg-error"
                label
                size="x-small"
                @click.stop="emit('delete')"
              >
                DELETE VENUE
              </v-chip>
            </span>
          </v-col>
        </v-row>
      </v-card-text>
    </div>
    <v-icon
      v-if="addIcon"
      icon="mdi-plus"
      color="primary"
      :size="mdAndUp ? 85 : 40"
      style="
        position: absolute;
        z-index: 5;
        top: 92px;
        left: 50%;
        transform: translate(-50%, -50%);
      "
    ></v-icon>
  </v-card>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { xs, mdAndUp } = useDisplay();

const props = defineProps<{
  venueData: {
    name: string;
    status: string;
    imageUrl: string;
    buttonLabel: string;
  };
  addIcon?: boolean;
  selected?: boolean;
}>();

const emit = defineEmits(["delete", "card-click", "edit-click"]);

const cardType = computed(() => {
  if (props.venueData.status === "Draft") {
    return "grey-darken-2";
  } else if (props.venueData.status === "Status") {
    return "black";
  } else if (props.venueData.status === "In Progress") {
    return "inprogress";
  } else {
    return "primary";
  }
});
</script>

<style scoped>
.blurred-card {
  filter: blur(2px) !important;
}
</style>
