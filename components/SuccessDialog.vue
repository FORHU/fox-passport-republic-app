<template>
  <v-dialog
    v-model="isDialogAppear"
    max-width="800px"
    class="password-reset-dialog"
  >
    <v-card class="password-reset-card">
      <v-card-title class="password-reset-title ma-auto">
        <v-img
          src="/images/success-icon.svg"
          alt="Success icon"
          class="password-reset-image ma-auto"
        ></v-img>
        <h2 class="text-h4 font-weight-bold mt-6">{{ messageHeader }}</h2>
      </v-card-title>

      <v-card-text class="password-reset-description">
        <p class="text-body-1 font-weight-medium text-center">
          {{ messageDescription }}
        </p>
      </v-card-text>

      <v-card-actions class="password-reset-actions">
        <v-btn
          color="success"
          class="back-to-venue-button ma-auto"
          elevation="4"
          @click="routePath == '' ? closeDialog() : routeToPage(routePath)"
        >
          {{ btnName }}
        </v-btn>
        <span class="password-reset-dot">.</span>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    successBoolean: {
      type: Boolean,
      default: false,
    },
    routePath: "",
    messageHeader: {
      type: String,
      default: "Registration successful!",
    },
    messageDescription: {
      type: String,
      default:
        "Now you can conveniently handle all your inquiries in a single location.",
    },
    btnName: {
      type: String,
      default: "Ok",
    },
  },
  methods: {
    closeDialog() {
      this.dialog = false;
    },
  },
};
</script>

<script setup>
let { isDialogAppear } = useLocal();

function routeToPage(data) {
  navigateTo(data);
  isDialogAppear.value = false;
}

watch(isDialogAppear, (newX) => {
  console.log(newX);
});
</script>

<style scoped>
.password-reset-dialog .v-card {
  border-radius: 10px;
  border: 15px solid rgba(56, 133, 79, 1);
}

.password-reset-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 18px;
  text-align: center;
}

.password-reset-image {
  max-width: 187px;
  width: 100%;
  aspect-ratio: 1.01;
  object-fit: contain;
}

.password-reset-description {
  align-self: flex-center;
  margin-top: 10px;
}

.password-reset-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 48px;
  width: 100%;
  max-width: 584px;
}

.back-to-venue-button {
  font-family: Montserrat, sans-serif;
  font-weight: 700;
  height: 50px;
  padding: 0px 50px;
  border-radius: 10px;
  text-transform: uppercase;
  background-color: #22c55e;
  color: white !important;
}

.password-reset-dot {
  color: #373941;
  font-family: Inter, sans-serif;
  font-weight: 400;
  align-self: flex-end;
  margin-top: 76px;
}
</style>
