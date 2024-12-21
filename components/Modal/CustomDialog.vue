<template>
  <!-- DIALOG MODAL -->
  <v-card>
    <v-card-title>
      <v-layout>
        <v-row>
          <v-col cols="12" v-if="imgSourcePath != ''">
            <img
              loading="lazy"
              :src="imgSourcePath"
              alt="Registration successful icon"
              class="self-center mt-5 max-w-full aspect-[1.01] w-[187px]"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" v-if="messageHeader != ''">
            <h2
              class="self-center mt-10 text-2xl font-medium leading-7 text-zinc-700"
            >
              {{ messageHeader }}
            </h2>
          </v-col>
        </v-row>
      </v-layout>
    </v-card-title>
    <v-card-text>{{ messageDescription }}</v-card-text>
    <v-card-action>
      <div
        v-if="okBtnBool != '' && cancelBtnBool != ''"
        class="d-flex justify-between"
      >
        <v-btn class="btn-primary" :color="okBtnColor" @click="okBtnBool">{{
          okBtnName
        }}</v-btn>
        <v-btn
          class="btn-primary"
          :color="cancelBtnColor"
          @click="cancelBtnBool"
          outlined
          >{{ cancelBtnName }}</v-btn
        >
      </div>
      <div
        v-if="okBtnBool != '' && cancelBtnBool == ''"
        class="d-flex justify-center"
      >
        <v-btn class="btn-primary" :color="okBtnColor" @click="okBtnBool">{{
          okBtnName
        }}</v-btn>
      </div>
    </v-card-action>
  </v-card>
</template>

<script>
export default {
  // data: ()=> ({
  //   dialog: false
  // }),
  // watch: {
  //   dialogBool(to) {
  //     this.dialog = to
  //   }
  // },
  props: {
    // dialogBool: {
    //   type: Boolean,
    //   required: true },
    imgSourcePath: "",
    messageHeader: "",
    messageDescription: "",
    okBtnBool: {
      type: Boolean,
    },
    okBtnName: {
      type: String,
      default: "Ok",
    },
    okBtnColor: {
      type: String,
      default: "#4CAF50",
    },
    cancelBtnBool: {
      type: Boolean,
    },
    cancelBtnName: {
      type: String,
      default: "Cancel",
    },
    cancelBtnColor: {
      type: String,
      default: "#F44336",
    },
  },
};
</script>

<style></style>
