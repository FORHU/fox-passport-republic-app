export default defineNuxtRouteMiddleware(async (to) => {
    const url = useRequestURL()
    const publicConfig = useRuntimeConfig()?.public
    const origin = url?.origin
    const altDomain = publicConfig.ALT_DOMAIN
    const mainUrl = publicConfig.MAIN_URL

    // Skip if ALT_DOMAIN or MAIN_URL is not configured
    if (!altDomain || !mainUrl) return;

    const altDomains = altDomain.split(',').filter(x => x.trim() !== '')
    
    if (altDomains.length > 0 && altDomains.some(x => origin.includes(x))) {
        return await navigateTo(mainUrl, { external: true })
    }
});
