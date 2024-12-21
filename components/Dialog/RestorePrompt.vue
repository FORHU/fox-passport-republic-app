<template>
  <v-dialog v-model="showDialog" max-width="600">
    <v-card min-height="250" class="pa-2">
      <v-row
        no-gutters
        class="text-subtitle-1 mt-5 font-weight-black text-center"
      >
        <v-col
          cols="12"
          class="text-h5 font-weight-bold"
          style="line-height: 1"
          >{{ promptTitle }}</v-col
        >
      </v-row>

      <v-row no-gutters class="fill-height text-caption" align="center">
        <v-col cols="12" class="text-center text-h6" style="line-height: 1">{{
          promptText
        }}</v-col>
      </v-row>

      <template v-slot:actions>
        <v-spacer></v-spacer>

        <v-btn
          variant="outlined"
          class="text-uppercase"
          @click="emit('disagree')"
        >
          {{ disagreeButtonText }}
        </v-btn>

        <v-btn
          variant="flat"
          color="yellow"
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
});

const showDialog = defineModel({ default: false });

const emit = defineEmits(["agree", "disagree"]);
</script>
