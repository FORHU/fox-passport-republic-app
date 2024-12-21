<template>
  <v-dialog v-model="showDialog" max-width="500">
    <v-card class="pa-2">
      <p
        class="mt-5 text-lg-h5 text-md-h5 text-sm-h5 text-xs-h5 font-weight-bold text-center mx-3"
      >
       You have a pending space for approval!
      </p>
      <p
        class="text-center text-lg-subtitle text-md-body-1 text-sm-body-1 text-xs-caption pa-5 mt-5"
      >
        Please note that at least one (1) published space is required to proceed
        with the approval of this venue.
      </p>

      <template v-slot:actions>
        <v-spacer></v-spacer>

        <v-btn
          variant="outlined"
          class="text-uppercase"
          @click="showDialog = false"
        >
          Got it!
        </v-btn>

        <v-btn
          variant="flat"
          color="blue"
          class="text-uppercase"
          @click="emit('go-to-spaces')"
        >
          Go to Spaces
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
<script setup>
const showDialog = defineModel({ required: true });

const emit = defineEmits(["go-to-spaces"]);
</script>
