<template>
  <v-dialog
    v-model="showDialog"
    max-width="1000"
    style="position: absolute; top: -70%"
    persistent
  >
    <v-card class="pa-5 w-100 py-10">
      <v-row>
        <v-col>
          <div class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon class="mr-3" color="mdi-success">mdi-check-circle</v-icon>
              <p class="font-weight-bold text-lg-h6">{{ text }}</p>
            </div>
            <v-btn
              type="submit"
              class="text-uppercase"
              color="secondary"
              @click="handleButtonClick"
              >{{ buttonText }}</v-btn
            >
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const showDialog = defineModel();

defineProps<{
  text: string;
  buttonText: string;
}>();

const emit = defineEmits(["button-click"]);

const handleButtonClick = () => {
  showDialog.value = false;
  emit("button-click");
};
</script>

<style scoped></style>
