<template>
  <v-dialog v-model="showEditEventDetailsDialog" max-width="500">
    <v-card height="100%" class="pa-1" style="overflow: hidden">
      <v-row class="pa-8 font-weight-bold">Edit Event Details</v-row>
      <v-row class="px-8">
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="100%"
        >
          <template #activator="{ props }">
            <v-text-field
              v-model="formattedDate"
              readonly
              persistent-hint
              v-bind="props"
              density="default"
              variant="plain"
              label="Pick a date"
              prepend-inner-icon="mdi-calendar"
            >
            </v-text-field>
          </template>
          <v-date-picker
            v-model="datePick"
            @input="dateInput = false"
            no-title
            scrollable
            :min="dateRef"
          >
            <template #actions>
              <v-btn color="primary" @click="dateInput = false">OK</v-btn>
            </template>
          </v-date-picker>
        </v-menu>
      </v-row>
      <v-row class="pl-2 pr-8" no-gutters>
        <v-col cols="5">
          <v-select variant="flat" prepend-inner-icon="mdi-clock"></v-select>
        </v-col>
        <v-col cols="2">
          <v-row class="pt-3" justify="center">
            <span class="text-h6">-</span>
          </v-row>
        </v-col>
        <v-col cols="5">
          <v-select variant="flat" prepend-inner-icon="mdi-clock"></v-select>
        </v-col>
      </v-row>
      <v-row class="pl-2 pr-8" no-gutters>
        <v-col cols="12">
          <v-select
            variant="flat"
            prepend-inner-icon="mdi-calendar-refresh"
            placeholder="Does not repeat"
          ></v-select>
        </v-col>
      </v-row>
      <v-row class="pa-5">
        <v-col cols="10">
          <v-row class="pa-3" justify="end">
            <v-btn color="secondary">Save</v-btn>
          </v-row>
        </v-col>
        <v-col cols="2">
          <v-btn variant="outlined" @click="showEditEventDetailsDialog = false"
            >Cancel</v-btn
          >
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>
<script setup>
const menu = ref(false);
const date = ref(null);
const datePick = ref(null);
const dateInput = ref(false);
const dateRef = ref(new Date().toISOString().substring(0, 10));
const showEditEventDetailsDialog = defineModel({ default: false });

const formattedDate = computed(() => {
  if (!datePick.value) return "";
  const date = new Date(datePick.value);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});
</script>
