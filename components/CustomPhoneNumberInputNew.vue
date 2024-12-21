<template>
  <v-row no-gutters>


    <v-col>
      <v-text-field ref="inputRef" v-model="inputNumber" 
        @update:model-value="handleChangeInput" variant="outlined" color="secondary" class="bg-transparent"
        :rules="phoneNumberRules" persistent-placeholder density="comfortable" rounded="lg" name="phone_number"
        id="phone_number" >

        <template v-slot:prepend-inner style="position:relative;">
          <span class="prefix clickable-prefix cursor-pointer d-flex align-center" @click.stop="toggleDropdown"
            style="position: relative;">
            {{ `(${dialCode})` }} <v-icon icon="mdi-chevron-down" size="15"></v-icon>
          </span>

          <v-select  v-if="showSelectNumber" variant="plain" v-model="dialCode" :items="codes" append-icon=""
            item-title="name" item-value="dial_code" style="width: 0px; opacity: 0; position: absolute;"
            @update:model-value="handleChangeCountry"  @update:menu="handleMenuUpdate" menu>

            <template v-slot:item="{ props, item }"  >
              <v-list-item @click="selectCountry(item)" v-bind="props" :title="`${item.raw.name} (${item.raw.dial_code})`" style="width: 250px"></v-list-item>
            </template>
          </v-select>
          <!-- <v-menu v-model="showSelectNumber" activator="parent" close-on-content-click style="max-height: 100px; overflow-y: auto; min-width: 200px; position: absolute;">
       <v-list style="width: 250px">
          <v-list-item
            v-for="code in codes"
            :key="code.dial_code"
            @click="selectCountry(code)"
          >
            <v-list-item-title>
              {{ `${code.name} (${code.dial_code})` }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu> -->
        </template>
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
const showSelectNumber = ref(false)

const formattedNumber = defineModel("formattedNumber");
const inputNumber = defineModel("input");
const dialCode = defineModel("dialCode");
const dropdownRef = ref(null);
const isDropdownOpen = ref(false);

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
  showSelectNumber.value = false;
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

//prefix
const prefixElement = document.querySelector('.v-text-field__prefix')
if (prefixElement) {
  prefixElement.style.cursor = 'pointer'
  prefixElement.addEventListener('click', () => {
    alert('working')
  })
}


onMounted(() => {
  dialCode.value = selectedCountry.value?.dial_code || '+65';
});


function toggleDropdown() {
  showSelectNumber.value = !showSelectNumber.value;
}
function selectCountry(code) {
  console.log(code)
  dialCode.value = code.dial_code;
  showSelectNumber.value = false; // Close dropdown after selection
}
function handleClickOutside() {
  console.log("click outside")
  showSelectNumber.value = false;
}
watch(
  () => dropdownRef.value?.menu?.isActive,
  (newVal) => {
    console.log('Dropdown visibility:', newVal);
    // isDropdownOpen.value = isActive;
    // console.log('Dropdown visibility changed:', isActive);
    // if (!isActive) {
    //   showSelectNumber.value = false; // Ensure dropdown state sync
    // }
  }
);
function handleMenuUpdate(isOpen) {
  isDropdownOpen.value = isOpen;
  if (!isOpen) {
    showSelectNumber.value = false; // Ensure dropdown state sync
  }
}
</script>

<style scoped>
.v-input :deep()::-webkit-inner-spin-button,
::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}
</style>
