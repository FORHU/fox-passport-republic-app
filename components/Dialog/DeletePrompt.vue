<template>
  <v-dialog v-model="showDialog" max-width="500">
    <v-card class="pa-2">
      <p
        v-if="showHeaderMessage"
        class="mt-5 text-lg-h5 text-md-h5 text-sm-h5 text-xs-h6 font-weight-bold text-center"
      >
        {{ promptTitle }}
      </p>
      <p
        class="text-center text-lg-h6 text-md-body-1 text-sm-body-1 text-xs-caption pa-5 mt-5"
      >
        {{ promptText }}
      </p>

      <template v-slot:actions>
        <v-spacer></v-spacer>

        <v-btn
          variant="outlined"
          class="text-uppercase"
          @click="emit('disagree')"
          v-if="showHeaderMessage"
        >
          {{ disagreeButtonText }}
        </v-btn>

        <v-btn
          variant="flat"
          :color="showHeaderMessage ? 'error' : 'secondary'"
          class="text-uppercase"
          @click="emit('agree')"
        >
          {{ agreeButtonText }}
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
<script setup>
const props = defineProps({
  promptTitle: String,
  promptText: String,
  disagreeButtonText: String,
  agreeButtonText: String,
  showHeaderMessage: Boolean,
});

const showDialog = defineModel("delete", { default: false });

const emit = defineEmits(["agree", "disagree"]);
</script>
