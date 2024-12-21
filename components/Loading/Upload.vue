<template>
  <Teleport to="body" class="w-100 h-100">
    <v-row
      no-gutters
      align-content="center"
      class="fill-height custom-class"
      justify="center"
    >
      <v-col class="text-subtitle-1 text-white text-center" cols="12">
        Uploading...
      </v-col>
      <v-col cols="2">
        <v-progress-linear
          color="white"
          height="10"
          indeterminate
          rounded
        ></v-progress-linear>
      </v-col>
    </v-row>
  </Teleport>
</template>

<script setup lang="ts"></script>

<style scoped>
.custom-class {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
