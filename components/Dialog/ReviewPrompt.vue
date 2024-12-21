<template>
  <v-dialog v-model="showDialog" max-width="600">
    <v-card min-height="250" class="pa-5">
      <!-- Title -->
      <v-row no-gutters>
        <v-col cols="12">
          <div class="text-h6 mt-2 font-weight-bold text-center">
            {{ promptTitle }}
          </div>
        </v-col>
      </v-row>

      <!-- Text Content -->
      <v-row no-gutters class="mt-3">
        <v-col cols="12">
          <div class="text-body-1 text-center">
            {{ promptText }}
          </div>
        </v-col>
      </v-row>

      <!-- Actions (Buttons) -->
      <v-row no-gutters class="mt-5">
        <v-col cols="12">
          <v-row justify="center">
            <v-col cols="auto">
              <v-btn
                variant="outlined"
                class="text-uppercase"
                @click="emit('disagree')"
              >
                {{ disagreeButtonText }}
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn
                variant="flat"
                color="secondary"
                class="text-uppercase"
                @click="emit('agree')"
              >
                {{ agreeButtonText }}
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
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

const showDialog = defineModel("review", { default: false });

const emit = defineEmits(["agree", "disagree"]);
</script>
