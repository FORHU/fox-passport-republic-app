<template>
  <v-dialog v-model="showDialog" max-width="600">
    <v-card rounded="lg">
      <v-row
        no-gutters
        class="bg-secondary pa-5 pa-md-7 text-subtitle-1 text-md-h6 font-weight-black d-flex justify-center"
        >You are not yet done.</v-row
      >
      <v-row no-gutters class="pa-5 pa-md-10 d-flex ga-10">
        <v-col
          cols="12"
          class="text-secondary d-flex justify-center text-subtitle-1 text-md-h6"
          >Please continue to the next page to complete the venue creation</v-col
        >
        <v-row no-gutters class="d-flex justify-center ga-5">
          <v-btn
            variant="outlined"
            color="error"
            size="large"
            @click="showDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            variant="flat"
            color="secondary"
            size="large"
            @click="emit('go-to')"
            >Go to next page</v-btn
          >
        </v-row>
      </v-row>
    </v-card>
  </v-dialog>
</template>
<script setup>
const showDialog = defineModel({ required: true });
const { country } = useLocal();

const emit = defineEmits(['go-to'])
</script>
