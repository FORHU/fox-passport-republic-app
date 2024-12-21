<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12" xs="12" sm="3" md="3" lg="3" xl="3" xxl="3">
        <v-sheet :height="xs ? '180' : '424'">
          <v-row>
            <v-col cols="12" class="d-flex align-center">
              <NuxtLink
                to="/"
                class="text-decoration-none text-black"
                variant="text"
              >
                <v-btn density="compact" icon="mdi-arrow-left"></v-btn>
                <span class="ml-2 mt-2">Back</span>
              </NuxtLink>
            </v-col>
            <v-col cols="12">
              <v-card variant="text">
                <v-card-title class="font-weight-bold text-subtitle-1"
                  >Articles in this section</v-card-title
                >
                <v-card-text class="ml-3">
                  <p
                    @click="setActiveCard(1)"
                    :class="selectedArticle === 1 ? 'bg-green-darken-2' : ''"
                    class="pa-3 rounded-lg"
                  >
                    What shoud be in my "rules of the space" section?
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
      <v-divider v-if="xs" class="my-3"></v-divider>
      <v-col cols="12" xs="12" sm="9" md="9" lg="9" xl="9" xxl="9">
        <SupportOnlinePayment />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { useDisplay } from "vuetify";
const { xs } = useDisplay();
const selectedArticle = ref(1);
function setActiveCard(number) {
  selectedArticle.value = number;
}
</script>
