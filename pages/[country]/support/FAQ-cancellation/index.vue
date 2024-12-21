<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="3">
        <v-sheet height="424">
          <v-row>
            <v-col cols="12" class="d-flex align-center">
              <v-btn density="compact" icon="mdi-arrow-left"></v-btn>
              <span class="ml-2 mt-1">Back</span>
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
                    What is the Venue4use cancellation and refund policy?
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
      <v-col cols="9">
        <SupportCancellationRefund />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
const selectedArticle = ref(1);
function setActiveCard(number) {
  selectedArticle.value = number;
}
</script>
