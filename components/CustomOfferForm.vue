<template>
         <v-card class="w-100 pa-5 pa-md-7" flat rounded="lg">
                    <v-row no-gutters class="mt-5 text-18px font-500">Date and time</v-row>

                    <v-row no-gutters justify="space-between">
                      <!-- Current Offer Column -->
                      <v-col cols="12" sm="5" md="5" class="mt-3 d-flex flex-column ga-3">
                        <v-row no-gutters class="text-16px font-500">Current</v-row>
                        <v-row no-gutters>
                          <v-text-field v-model="oldData.date" append-inner-icon="mdi-calendar-badge" rounded="lg"
                            variant="outlined" dense disabled class="bg-tertiary" readonly hide-details></v-text-field>
                        </v-row>
                        <v-row no-gutters>
                          <v-select v-model="oldData.from" append-inner-icon="mdi-clock-time-three-outline" rounded="lg"
                            variant="outlined" dense hide-details :items="timesFrom" item-title="label"
                            item-value="value" :rules="[requiredInput]" disabled class="bg-tertiary">
                          </v-select>
                        </v-row>
                        <v-row no-gutters>
                          <v-select v-model="oldData.to" append-inner-icon="mdi-clock-time-three-outline" rounded="lg"
                            variant="outlined" dense hide-details :items="timesFrom" item-title="label"
                            item-value="value" :rules="[requiredInput]" disabled class="bg-tertiary">
                          </v-select>
                        </v-row>
                      </v-col>


                      <!-- New Offer Column -->
                      <v-col cols="12" sm="5" md="5" class="mt-3 d-flex flex-column ga-3">
                        <v-row no-gutters class="text-16px font-500">New</v-row>
                        <v-row no-gutters style="position: relative">

                          <v-menu v-model="dateInput" :close-on-content-click="false" :nudge-right="40"
                            transition="scale-transition" offset-y min-width="290px">
                            <template #activator="{ props }">
                              <v-text-field dense v-model="newData.date" readonly persistent-hint v-bind="props" rounded="lg"
                                placeholder="Select Date" append-inner-icon="mdi-calendar-badge" variant="outlined"
                                :rules="[requiredInput]" hide-details @update:model-value="handleDateChange">
                              </v-text-field>
                            </template>
                            <v-date-picker v-model="date_calendar" @input="dateInput = false" show-adjacent-months
                              elevation="24" no-time @update:model-value="handleDateChange"
                              :min="new Date().toISOString().substring(0, 10)" placeholder="Select a date"
                              :allowed-dates="getAllowedDates"></v-date-picker>
                          </v-menu>
                        </v-row>
                        <v-row no-gutters>
                          <FormSelectCustom v-model="newData.from" append-inner-icon="mdi-clock-time-three-outline" rounded="lg"
                            variant="outlined" dense hide-details :items="checkAllowedTimeFrom" item-title="label"
                            item-value="value" :rules="[requiredInput]" @update:model-value="handleTimeFromChange"
                            placeholder="Select time">
                          </FormSelectCustom>
                        </v-row>
                        <v-row no-gutters>
                          <FormSelectCustom :disabled="!newData.from" v-model="newData.to" rounded="lg"
                            append-inner-icon="mdi-clock-time-three-outline" variant="outlined" dense hide-details
                            :items="checkAllowedTimeTo" item-title="label" item-value="value" :rules="[requiredInput]"
                            @update:model-value="emit('recompute')" placeholder="Select time">
                          </FormSelectCustom>
                        </v-row>
                      </v-col>
                    </v-row>

                    <v-divider class="mt-7 mb-5"></v-divider>

                    <v-row no-gutters class="text-18px font-500">Guests</v-row>

                    <v-row no-gutters justify="space-between">
                      <!-- Current Guests -->
                      <v-col cols="12" sm="5" md="5" class="mt-3 d-flex flex-column ga-3">
                        <v-row no-gutters class="text-16px font-500">Current</v-row>
                        <v-row no-gutters>
                          <v-text-field v-model="oldData.guests" append-inner-icon="mdi-account-multiple-outline" rounded="lg"
                            variant="outlined"  disabled class="bg-tertiary"
                            hide-details></v-text-field>
                        </v-row>
                      </v-col>

                      <!-- Spacer column (visible only on small screens) -->
                      <v-col cols="1" class="d-none d-sm-block"></v-col>

                      <!-- New Guests -->
                      <v-col cols="12" sm="5" md="5" class="mt-3 d-flex flex-column ga-3">
                        <v-row no-gutters class="text-16px font-500">New</v-row>
                        <v-row no-gutters>
                          <v-text-field type="number" v-model.number="newData.guests"
                            append-inner-icon="mdi-account-multiple-outline" variant="outlined"  rounded="lg"
                            hide-details :rules="[requiredInput]" @update:model-value="emit('recompute')"></v-text-field>
                        </v-row>
                      </v-col>
                    </v-row>

                    <v-divider class="mt-7 mb-5"></v-divider>

                    <v-row no-gutters class="mt-5 text-18px font-500">Space Rental</v-row>

                    <v-row no-gutters justify="space-between">
                      <!-- Current Space Rental -->
                      <v-col cols="12" sm="5" class="mt-3 d-flex flex-column ga-3">
                        <v-row no-gutters class="text-16px font-500">Current</v-row>
                        <v-row no-gutters>
                          <v-text-field v-model="oldData.payment_computation.user.subtotal
                            " variant="outlined" :prefix="getCurrencySymbol(oldData.currency)" rounded="lg"
                             disabled class="bg-tertiary" :suffix="withGST ? 'GST inc.' : ''"
                            persistent-placeholder hide-details></v-text-field>
                        </v-row>
                      </v-col>

                      <v-col cols="1" class="d-none d-sm-block"></v-col>

                      <!-- New Space Rental -->
                      <v-col cols="12" sm="5" class="mt-3 d-flex flex-column ga-3">
                        <v-row no-gutters class="text-16px font-500">New</v-row>
                        <v-row no-gutters>
                          <v-text-field type="number" v-model.number="newData.payment_computation.user.subtotal
                            " variant="outlined" :prefix="getCurrencySymbol(oldData.currency)" rounded="lg"
                             hide-details persistent-placeholder
                            :suffix="withGST ? 'GST inc.' : ''" :rules="[requiredInput]"
                            @update:model-value="updateUserSubtotal"></v-text-field>
                        </v-row>
                      </v-col>
                    </v-row>

                    <v-divider class="mt-7 mb-5"></v-divider>

                    <v-row no-gutters class="mt-5 text-18px font-500">Cleaning Fee</v-row>

                    <v-row no-gutters justify="space-between">
                      <!-- Current Cleaning Fee -->
                      <v-col cols="12" sm="5" class="mt-3 d-flex flex-column ga-3">
                        <v-row no-gutters class="text-16px font-500">Current</v-row>
                        <v-row no-gutters>
                          <v-text-field v-model="oldData.payment_computation.user
                              .cleaning_fee
                            " variant="outlined" :prefix="getCurrencySymbol(oldData.currency)" rounded="lg"
                             disabled class="bg-tertiary" :suffix="withGST ? 'GST inc.' : ''"
                            persistent-placeholder hide-details></v-text-field>
                        </v-row>
                      </v-col>

                      <v-col cols="1" class="d-none d-sm-block"></v-col>

                      <!-- New Cleaning Fee -->
                      <v-col cols="12" sm="5" class="mt-3 d-flex flex-column ga-3">
                        <v-row no-gutters class="text-16px font-500">New</v-row>
                        <v-row no-gutters>
                          <v-text-field type="number" v-model.number="newData.payment_computation.user
                              .cleaning_fee
                            " variant="outlined" :prefix="getCurrencySymbol(oldData.currency)" rounded="lg"
                            hide-details persistent-placeholder
                            :suffix="withGST ? 'GST inc.' : ''"
                            @update:model-value="updateUserCleaningFee"></v-text-field>
                        </v-row>
                      </v-col>
                    </v-row>


                    
                  </v-card>
</template>

<script setup lang="ts">



const { requiredInput } = useUtils();
const { country, getCurrencySymbol, setSnackbar } = useLocal();
const {space, timesFrom, allowedTime, allowedDatesChecker, checkTimesToFunction } = useSpace();
const { withGST } = useTax();
const dateInput = ref(false);
const date_calendar = ref<null | Date[]>(null);

type TOldOffer = {
  currency: string;
  date: string;
  from: string | null;
  guests: number | null;
  to: string | null;
  payment_computation: {
    venue: {
      commission_fee: number | null;
      grand_total: string | null;
      subtotal: string | null;
      cleaning_fee: number | null;
    };
    user: {
      rebate: number | null;
      grand_total: string | null;
      subtotal: string | null;
      cleaning_fee: number | null;
    };
  };
}

const oldData = defineModel<TOldOffer>('old', { required: true})
const newData = defineModel<TComputedOffer>('new', { required: true})
const bookings = defineModel('bookings', {required: true})

const emit = defineEmits(['recompute', 'load-bookings'])


const updateUserSubtotal = () => {
  const { payment_computation } = newData.value;
  const userSubtotal = payment_computation.user.subtotal;
  payment_computation.venue.subtotal = userSubtotal;
};

const updateUserCleaningFee = () => {
  const { payment_computation } = newData.value;
  const userCleaningFee = payment_computation.user.cleaning_fee;
  payment_computation.venue.cleaning_fee = userCleaningFee;
};

// calendar
const formattedDate = computed(() => {
  if (!date_calendar.value) return "";
  const date = new Date(date_calendar.value as any);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

watch(date_calendar, () => {
  newData.value.date = formattedDate.value;
  emit('recompute')
  emit('load-bookings')
});

const dateConverter = (dateString: string) => {
  if (!dateString) return;

  const dd = dateString.slice(0, 2);
  const mm = dateString.slice(3, 5);
  const yyyy = dateString.slice(6, 10);

  return `${yyyy}-${mm}-${dd}`;
};

watch(
  () => newData.value.date,
  (newVal) => {
    if (newData.value.date) {
      date_calendar.value = [new Date(dateConverter(newVal as string) as any)];
    }
  }, { immediate: true});

const checkAllowedTimeFrom = computed(() => {
  if (!date_calendar.value || !date_calendar.value[0]) return [];
  return allowedTime(
    space.value.pricing,
    date_calendar.value[0],
    bookings.value,
  );
});

const checkAllowedTimeTo = computed(() => {
  if (
    !date_calendar.value ||
    !date_calendar.value[0] ||
    !newData.value.from
  )
    return [];
  return checkTimesToFunction(
    space.value.pricing,
    date_calendar.value[0],
    newData.value.from,
    bookings.value,
  );
});

function getAllowedDates(val: any) {
  return allowedDatesChecker(space.value.pricing, val);
}



const handleDateChange = () => {
  dateInput.value = false;
  newData.value.from = null;
  newData.value.to = null;
  newData.value.payment_computation.user = {
    subtotal: null,
    commission_fee: null,
    grand_total: null,
    cleaning_fee: null,
  };
};
const handleTimeFromChange = () => {
    newData.value.to = null;
    newData.value.payment_computation.user = {
    subtotal: null,
    commission_fee: null,
    grand_total: null,
    cleaning_fee: null,
  };
};

</script>

<style scoped>

</style>