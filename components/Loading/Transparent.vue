<template>
  <Teleport to="body">
    <div class="custom-class">
      <v-progress-circular
        :size="50"
        color="white"
        indeterminate
      ></v-progress-circular>
    </div>
  </Teleport>
</template>

<script setup lang="ts"></script>

<style scoped>
.custom-class {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
