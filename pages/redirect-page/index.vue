<template>
    <div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'bare'
})
const { url} = useRoute().query

const redirectToUrl = () => {
    navigateTo(url , {external: true})
}

onMounted(() => {
    redirectToUrl()
})

</script>

<style scoped>

</style>