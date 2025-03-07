<template>
  <v-row no-gutters>
    <v-col cols="12">
      <v-img
        height="80vh"
        src="/images/list-your-venue/lister-background.jpg"
        cover
        alt="List Your Venue Image"
      >
        <v-row
          no-gutters
          class="fill-height primary-gradient"
          align-content="center"
          justify="center"
        >
          <v-col cols="12" xxl="10" xl="10" lg="10">
            <v-row no-gutters>
              <v-row no-gutters class="text-center">
                <v-col cols="12" class="text-h2 font-weight-bold text-white">
                  List your Venue
                </v-col>
                <v-col cols="12" class="mt-10">
                  <ButtonFlatLooseButton
                    @click="lister = true"
                    label="get started"
                    class="bg-white"
                    width="150px"
                  />
                </v-col>
              </v-row>
            </v-row>
          </v-col>
        </v-row>
      </v-img>
    </v-col>
  </v-row>
  <v-dialog persistent width="741px" v-model="lister">
    <signup-venue-lister
      @icon-click="closeDialog"
      @registerSucess="registerSucess"
    ></signup-venue-lister>
  </v-dialog>
  <DialogSuccessWithButton
    v-model="showSucessDialog"
    text="Registration Successful"
    button-text="Got it!"
    @click="navigateTo({ name: 'country', params: { country } })"
  />
</template>
<script setup>
const { lister } = useSignup();
const showSucessDialog = ref(false);
const closeDialog = () => {
  lister.value = false;
};
const registerSucess = () => {
  lister.value = false;
  showSucessDialog.value = true;
};
</script>
