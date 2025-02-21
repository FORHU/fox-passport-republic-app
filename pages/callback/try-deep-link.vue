<template>
    <div>
        <v-btn @click="goToApp">Open App</v-btn>
    </div>
</template>

<script setup lang="ts">

const goToApp = () => {

    const deepLink = "venue4use://";


    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.venue4use&pcampaignid=web_share'
    const appStoreUrl = 'https://apps.apple.com/ph/app/venue4use/id6736890246'

    const start = Date.now();

    window.location.href = deepLink;

    setTimeout(() => {
        const elapsed = Date.now() - start;
        if (elapsed < 1500) {
            return;
        }

        if (navigator.userAgent.includes('Android')) {
            window.location.href = playStoreUrl;
        } else if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
            window.location.href = playStoreUrl;
        }
    })

}



</script>

<style scoped></style>