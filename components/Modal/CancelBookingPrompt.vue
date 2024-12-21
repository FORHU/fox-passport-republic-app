<template>
  <v-dialog v-model="showCancelBookingDialog" max-width="500">
    <v-card min-height="250" class="pa-2">
      <v-row no-gutters class="fill-height" align="center">
        <v-col cols="12" class="text-center text-h6" style="line-height: 1">
          <span
            >Are you sure you want to
            <span style="color: red">Cancel?</span></span
          >
        </v-col>
      </v-row>
      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          class="text-uppercase"
          @click="emit('disagree')"
        >
          No
        </v-btn>
        <v-btn
          variant="flat"
          color="error"
          class="text-uppercase"
          @click="emit('agree')"
        >
          Yes,Cancel This Booking
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
<script setup>
const showCancelBookingDialog = defineModel("show", { default: false });

const emit = defineEmits(["agree", "disagree"]);
</script>
