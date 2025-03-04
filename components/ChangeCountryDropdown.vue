<template>
    <v-select :model-value="countrySelected" :items="registeredCountries"
        item-value="cca2" hide-details placeholder="Select Country" menu-icon="" item-title="country_name" rounded="lg"
        style="min-width: 170px" @update:model-value="handleChangeCountry" :base-color="showDisplay ? '#373941' : 'white'" :class="showDisplay ? 'dark' : 'white text-white'">
        <template v-slot:append-inner>
            <v-img v-if="flag" :src="flag" width="20px" alt="flag-image"></v-img>
            <v-icon v-else icon="mdi-map-marker-outline"></v-icon>
        </template>
    </v-select>
</template>

<!-- mdi-map-marker-outline -->

<script setup lang="ts">
const { registeredCountries } = useLocal();

const currentCountry = computed(() => {
    return useCookie('country').value
})

const showDisplay = defineModel('display', {default: false})

const countrySelected = ref<string | null>(null)
const flag = ref<string | null>(null)


const getFlag = () => {
    if (countrySelected.value) {
        const obj = registeredCountries.value.find(x => x?.cca2?.toLowerCase() == countrySelected.value?.toLowerCase())
        if (obj && obj?.flag_url) {
            flag.value = obj.flag_url
        } else flag.value = null;

    } else {
        flag.value = null
    }

}

const handleChangeCountry = async (val: string) => {
    if(!val) return;
    useCookie('country').value = val.toLocaleLowerCase();
    await navigateTo(`/${val.toLowerCase()}`)
    fetchInit()
    // reloadNuxtApp({ path: `/${val.toLowerCase()}`})
    
}

const fetchInit = () => {
    const country = currentCountry.value
    
    if (country && typeof country == 'string') {
        const obj = registeredCountries.value.find(x => x?.cca2?.toLowerCase() == country.toLowerCase())
        if (obj) {
            countrySelected.value = country?.toUpperCase();
            getFlag()
        }
    } else {
        countrySelected.value = null
    }
}

watchEffect(() => {
    fetchInit()
})

</script>

<style scoped>
.v-input.dark :deep(input::placeholder) {
    color: '#373941' !important;
    font-size: 14px;
}

.v-input.white :deep(input::placeholder) {
    color: white !important;
    font-size: 14px;
}
</style>