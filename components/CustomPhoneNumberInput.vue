<template>
  <v-row no-gutters>
    <v-col cols="2">
      <v-select
        variant="plain"
        :prepend-icon="addIcon ? 'mdi-cellphone' : ''"
        v-model="dialCode"
        :items="codes"
        class="ma-0 py-0"
        item-title="name"
        item-value="dial_code"
        style="max-width: 130px; max-width: fit-content"
        @update:model-value="handleChangeCountry"
      >
        <template v-slot:item="{ props, item }">
          <v-list-item
            v-bind="props"
            :title="`${item.raw.name}`"
            style="width: 250px"
          ></v-list-item>
        </template>

        <template v-slot:chip="{ props, item }">
          <span>{{ item.raw.flag }}</span>
        </template>
      </v-select>
    </v-col>

    <v-col>
      <v-text-field
        ref="inputRef"
        v-model="inputNumber"
        placeholder="Enter your mobile number"
        @update:model-value="handleChangeInput"
        :prefix="dialCode"
        variant="underlined"
        color="secondary"
        class="bg-transparent"
        :rules="phoneNumberRules"
        persistent-placeholder
        name="phone_number"
        id="phone_number"
      >
      </v-text-field>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import countries from "~/data/countries.json";
const { country } = useLocal();
// const { signupForm } = useSignup();

defineProps({
  addIcon: {
    required: false,
    type: Boolean,
  },
});

const codes = ref(toRaw(countries));

const formattedNumber = defineModel("formattedNumber");
const inputNumber = defineModel("input");
const dialCode = defineModel("dialCode");

let phoneNumberRules = computed(() => {
  return [
    (v: any) => !!v || "Field is required",
    (v: any) => !isNaN(v) || "Input numbers only",
    (v: any) => {
      if (!v) return true;

      if (!selectedCountry.value?.dial_code) return "Please select a country";

      const regexPattern = new RegExp(selectedCountry.value.regex);
      return regexPattern.test(dialCode.value + v) || "Invalid phone number";
    },
  ];
});

const handleChangeInput = () => {
  formattedNumber.value = dialCode.value + inputNumber.value;
};

const handleChangeCountry = () => {
  (inputNumber.value = ""), (formattedNumber.value = "");
};

const selectedCountry = computed(() => {
  if (!dialCode.value) {
    return toRaw(countries).find(
      (x) => x.code.toLowerCase() === country?.toLowerCase(),
    );
  } else {
    return toRaw(countries).find((x) => x.dial_code === dialCode.value);
  }
});

onMounted(() => {
  dialCode.value = selectedCountry.value?.dial_code;
});
</script>

<style scoped>
.v-input :deep()::-webkit-inner-spin-button,
::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}
</style>
