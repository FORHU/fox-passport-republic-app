<template></template>

<script setup lang="ts">
const { country } = useLocal();

navigateTo({ name: "country", params: { country } });
</script>
