<template>
  <v-row no-gutters justify="center">
    <v-col cols="auto">
      <v-card
        elevation="0"
        rounded="lg"
        :border="'black sm'"
        :max-width="mdAndUp ? '450px' : '370px'"
        style="border: 1px solid black !important"
      >
        <v-row no-gutters class="pa-3 pa-sm-5" align="start">
          <v-col
            cols="12"
            class="font-weight-regular text-subtitle-1"
            justify="center"
            ><v-icon
              icon="mdi-account-box"
              class="mr-2"
              :size="mdAndUp ? 30 : 20"
            ></v-icon>
            {{ customerName }} asked for contact number</v-col
          >
          <v-divider class="my-2"></v-divider>
          <v-col
            cols="12"
            class="font-weight-regular text-subtitle-1"
            justify="center"
            ><v-icon icon="mdi-phone" class="mr-2" size="25"></v-icon
            >{{ contactName }} {{ contactNumber }}</v-col
          >
        </v-row>
      </v-card>
      <v-row
        no-gutters
        class="mt-1 text-caption text-sm-subtitle-2 mx-2"
        style="opacity: 60%"
        >{{ timeStamp }}</v-row
      >
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();

defineProps<{
  customerName: string;
  contactName: string;
  contactNumber: string;
  timeStamp: string;
}>();
</script>

<style scoped></style>
