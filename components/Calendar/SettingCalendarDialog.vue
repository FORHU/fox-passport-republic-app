<template>
  <v-dialog v-model="showCalendarSettingsDialog" max-width="700">
    <v-card height="100%" class="pa-1" style="overflow: hidden">
      <v-row justify="center" class="pt-10 pl-10 pr-10 font-weight-bold text-h6"
        >Calendar Setting</v-row
      >
      <v-row class="pl-10 pr-10 font-weight-bold">
        <v-col cols="6"> Book calendar during bank holidays </v-col>
        <v-col cols="6">
          <v-switch v-model="switchValue" class="ma-n4"></v-switch>
        </v-col>
      </v-row>
      <v-row class="pl-12 pr-10 mt-n5">
        Customers will not be able to see or book your venues for bank / public
        holiday dates.
      </v-row>
      <div class="pt-10" v-if="switchValue">
        <v-row class="pl-12 pr-10"> Assign Venues </v-row>
        <v-row class="pl-14 pr-10 mb-n8">
          <v-radio-group v-model="assignVenue">
            <v-radio label="All Venues" value="allVenue"></v-radio>
            <v-radio label="Select Venues" value="selectedVenue"></v-radio>
          </v-radio-group>
        </v-row>
        <v-row
          class="pl-16 mr-7 pb-n10 mt-n2"
          v-if="assignVenue == 'selectedVenue'"
        >
          <v-container max-height="200" style="overflow-y: auto">
            <v-row v-for="(item, index) in venueList" :key="index">
              <v-checkbox
                :value="item"
                v-model="checkedItems[index]"
                @change="updateCheckedItems"
                :label="item"
                class="mt-n2 mb-n10"
              ></v-checkbox>
            </v-row>
          </v-container>
        </v-row>
      </div>
      <v-row class="pl-12 pr-10 pt-10 font-weight-bold"> Advice notice </v-row>
      <v-row class="pl-12 pr-10 pt-4">
        <v-select :items="noticeList"></v-select>
      </v-row>
      <v-row class="pl-12 pr-5">
        Indicate how much notice do you need between a customer’s booking and
        their event.
      </v-row>
      <v-row class="pa-2 pb-5">
        <v-col cols="10">
          <v-row class="pa-3" justify="end">
            <v-btn variant="outlined" @click="emit('exitCalendarSettingDialog')"
              >Cancel</v-btn
            >
          </v-row>
        </v-col>
        <v-col cols="2">
          <v-btn color="secondary">Save</v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>
<script setup>
let venueList = ref(["Social Space", "Tommy House", "Davids PUB"]);
let switchValue = ref(false);
let checkedItems = ref([]);
let assignVenue = ref("");
let noticeList = ref([
  "None",
  "At Least one day",
  "At Least two day",
  "At Least three day",
  "At Least seven day",
]);
const showCalendarSettingsDialog = defineModel("review", { default: false });

const emit = defineEmits(["agree", "disagree", "exitCalendarSettingDialog"]);

function updateCheckedItems() {
  checkedItems.value = venueList.value.filter(
    (item, index) => checked.value[index],
  );
}
const checked = computed(() => {
  const checkedMap = {};
  checkedItems.value.forEach((item) => {
    const index = venueList.value.indexOf(item);
    checkedMap[index] = true;
  });
  return checkedMap;
});
</script>
