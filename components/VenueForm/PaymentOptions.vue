<template>
    <v-row no-gutters class="mt-1 w-100">
        <v-row no-gutters class="font-500 text-18px mb-1">Choose your payment option</v-row>
        <template v-for="x in paymentOption" :key="x.key">
            <v-col cols="12" v-if="x.key" class="my-1">
                <v-card flat width="100%" :ripple="editable" min-height="67px" rounded="lg" class="cursor-pointer"
                    @click="selectType(x.key)"
                    :style="{ border: x.key == paymentType ? '1px solid rgba(var(--v-theme-secondary)' : '1px solid #DEDFE3' }">
                    <v-row no-gutters class="pa-3" align="center">
                        <v-col class="d-flex ga-2 align-center">
                            <div class="d-flex flex-column">
                                <span class="w-100 font-500 text-16px">{{ x.title }}</span>
                                <span class="w-100 text-14px">{{ x.subtitle }}</span>
                            </div>
                        </v-col>
                        <span>
                            <v-checkbox color="secondary" base-color="light_gray_secondary" hide-details readonly
                                :model-value="x.key == paymentType"></v-checkbox>
                        </span>
                    </v-row>
                </v-card>
            </v-col>
        </template>
    </v-row>
</template>

<script setup lang="ts">

const venue = defineModel<TVenue>({ required: true })

const paymentType = ref('COMMISSION')
const editable = ref(false);

const selectType = (key: 'COMMISSION' | 'SUBSCRIPTION') => {
    if (!key) return;
    if (!editable.value) return; // return if subscription has boolean value
    paymentType.value = key;
    venue.value.payment_method = key
}


const paymentOption = ref([
    {
        title: 'Commission-based payment',
        subtitle: 'Pay using a percentage of sales.',
        key: 'COMMISSION'
    },
    {
        title: 'Subscription-based payment',
        subtitle: 'Pay using recurring fees monthly.',
        key: 'SUBSCRIPTION'
    }
])


onMounted(() => {
    const { payment_method } = venue.value
    // if (payment_method == null) {
    //     editable.value = true;
    // } else {
    //     paymentType.value = payment_method
    // }

    if (payment_method == null) {
        paymentType.value = 'COMMISSION'
        venue.value.payment_method = 'COMMISSION'
    } else {
        paymentType.value = payment_method
    }
    editable.value = true;
})

</script>

<style scoped></style>
