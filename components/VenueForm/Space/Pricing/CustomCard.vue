<template>
  <v-row no-gutters>
    <v-col cols="8" class="d-flex flex-wrap align-center">
      <v-checkbox
        color="primary"
        v-model="checkBoxBool"
        style="height: 55px"
      ></v-checkbox>
      <span class="text-subtitle-1 py-0 my-auto font-weight-bold">{{
        feeTitle
      }}</span>
    </v-col>
  </v-row>
  <v-row no-gutters v-if="checkBoxBool">
    <v-col
      cols="12"
      style="background-color: rgb(128, 145, 175, 0.5)"
      class="rounded-xl pa-2 mr-2 mt-1"
    >
      <div v-for="(item, index) in arrayOfData" :key="index">
        <v-row no-gutters>
          <v-col cols="2">
            <v-row no-gutters>
              <v-col cols="12" class="d-flex align-center">
                <span class="text-subtitle-2 font-weight-bold ml-2">Price</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12">
                <span class="text-caption pl-2">{{ feeTitle }}</span>
                <v-text-field
                  @input="updateData"
                  v-model="item.price"
                  class="px-2 my-input"
                  variant="solo"
                  :rules="[
                    (v) => !!v || 'Field is required',
                    (v) => !isNaN(v) || 'Input number only',
                  ]"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="2">
            <v-row no-gutters>
              <v-col cols="12" class="d-flex align-center">
                <span class="text-subtitle-2 font-weight-bold ml-2"
                  >Duration</span
                >
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12">
                <span class="text-caption pl-2"></span>
                <v-text-field
                  @input="updateData"
                  v-model="item.duration"
                  class="px-2 my-input"
                  variant="solo"
                  :rules="[
                    (v) => !!v || 'Field is required',
                    (v) => !isNaN(v) || 'Input number only',
                  ]"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="2">
            <v-row no-gutters>
              <v-col cols="12" class="d-flex align-center">
                <span class="text-subtitle-2 font-weight-bold ml-2">Time</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12">
                <span class="text-caption pl-2">From</span>
                <v-text-field
                  @input="updateData"
                  v-model="item.time.from"
                  class="px-2 my-input"
                  variant="solo"
                  :rules="[
                    (v) => !!v || 'Field is required',
                    (v) => !isNaN(v) || 'Input number only',
                  ]"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="2">
            <v-row no-gutters>
              <v-col cols="12" style="margin-top: 22.5px">
                <span class="text-caption pl-2">To</span>
                <v-text-field
                  @input="updateData"
                  v-model="item.time.to"
                  class="px-2 my-input"
                  variant="solo"
                  :rules="[
                    (v) => !!v || 'Field is required',
                    (v) => !isNaN(v) || 'Input number only',
                  ]"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="3">
            <span></span>

            <v-chip-group
              v-model="item.weekDays"
              multiple
              column
              selected-class="bg-primary"
              class="d-flex flex-column"
            >
              <v-row no-gutters>
                <v-col cols="12" class="d-flex align-center">
                  <span class="text-subtitle-2 font-weight-bold ml-2"
                    >Week/Days</span
                  >
                </v-col>
              </v-row>
              <span class="mx-0 mt-4 text-h6 font-weight-bold"></span>
              <v-row no-gutters>
                <v-col cols="12">
                  <div class="px-1">
                    <v-row no-gutters>
                      <v-col
                        class="d-flex flex-column align-center"
                        v-for="(x, id) in days"
                        :key="id"
                      >
                        <span
                          class="text-caption pl-2"
                          style="position: relative; bottom: -12px; left: -2px"
                          >{{ x }}</span
                        >
                        <v-checkbox
                          color="primary"
                          :value="x"
                          class="rounded"
                        ></v-checkbox>
                      </v-col>
                    </v-row>
                  </div>
                </v-col>
              </v-row>
            </v-chip-group>
          </v-col>

          <v-col cols="1" class="d-flex align-center justify-center">
            <v-icon
              class="d-flex justify-center align-center"
              style="margin: auto; height: 100%"
              v-if="arrayOfData.length > 1"
              icon="mdi-trash-can"
              @click="arrayOfData.splice(index, 1)"
            ></v-icon>
          </v-col>
        </v-row>
        <v-row no-gutters> </v-row>
      </div>
    </v-col>
    <v-row no-gutters v-if="arrayOfData.length <= 2">
      <v-col cols="12" class="d-flex justify-end">
        <v-btn
          color="primary"
          @click="arrayOfData.push(addRowObject)"
          class="my-5"
        >
          Add Row
        </v-btn>
      </v-col>
    </v-row>
  </v-row>
</template>

<script setup>
defineProps({
  feeTitle: String,
  disableMode: String,
  feeDescription: String,
  feePrice: String,
  feeDuration: String,
  feeTimeFrom: String,
  feeTimeTo: String,
  arrayOfData: Array,
  checkBoxBool: Boolean,
});

function updateData() {
  let newArr = [];
  let arrayOfData = [
    mediumSpend.value ? minimunSpendData.value : "",
    hire_fee.value ? hire_feeData.value : "",
    packagePerPerson.value ? packagePerPersonData.value : "",
    hire_feePlusMinSpend.value ? hire_feePlusMinSpendData.value : "",
    hire_feePlusPackPerPerson.value ? hire_feePlusPackPerPersonData.value : "",
  ];
  let removeEmpty = arrayOfData.filter((item) => item != "");
  removeEmpty.forEach((item) => {
    return newArr.push(...item);
  });

  objectOfCustomPricingData.value.custom_price.prices = newArr;
}

const days = ref(["S", "M", "T", "W", "T", "F", "S"]);
const addRowObject = ref({
  price: 0,
  duration: 0,
  time: {
    from: "",
    to: "",
  },
  weekDays: [],
});

const timeSelect = ref([
  {
    name: "01:00",
    value: 1,
  },
  {
    name: "02:00",
    value: 2,
  },
  {
    name: "03:00",
    value: 3,
  },
  {
    name: "04:00",
    value: 4,
  },
  {
    name: "05:00",
    value: 5,
  },
  {
    name: "06:00",
    value: 6,
  },
  {
    name: "07:00",
    value: 7,
  },
  {
    name: "08:00",
    value: 8,
  },
  {
    name: "09:00",
    value: 9,
  },
  {
    name: "10:00",
    value: 10,
  },
  {
    name: "11:00",
    value: 11,
  },
  {
    name: "12:00",
    value: 12,
  },
  {
    name: "13:00",
    value: 13,
  },
  {
    name: "14:00",
    value: 14,
  },
  {
    name: "15:00",
    value: 15,
  },
  {
    name: "16:00",
    value: 16,
  },
  {
    name: "17:00",
    value: 17,
  },
  {
    name: "18:00",
    value: 18,
  },
  {
    name: "19:00",
    value: 19,
  },
  {
    name: "20:00",
    value: 20,
  },
  {
    name: "21:00",
    value: 21,
  },
  {
    name: "22:00",
    value: 22,
  },
  {
    name: "23:00",
    value: 23,
  },
  {
    name: "24:00",
    value: 24,
  },
]);
</script>

<style></style>
