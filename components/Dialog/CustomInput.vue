<template>
  <v-dialog v-model="showDialog" max-width="500">
    <v-card class="pa-2">
      <v-row no-gutters align="center" justify="center">
        <v-text-field
          v-model="menu"
          placeholder="Please type your custom menue"
          variant="outlined"
          hide-details
          density="comfortable"
        >
          <template v-slot:append>
            <v-btn variant="flat" color="primary" @click="textInput = menu"
              >Add Menu</v-btn
            >
          </template>
        </v-text-field>
      </v-row>
    </v-card>
  </v-dialog>
</template>
<script setup>
const showDialog = defineModel("show", { default: false });
const textInput = defineModel("input", { default: "" });

const menu = ref("");

const emit = defineEmits(["agree", "disagree"]);
</script>
