export default defineNuxtRouteMiddleware(async (to) => {

    const url = useRequestURL()
    const publicConfig = useRuntimeConfig()?.public
    const origin = url?.origin
    const altDomains = publicConfig.ALT_DOMAIN.split(',')
    const mainUrl = publicConfig.MAIN_URL



    if(altDomains.some(x => origin.includes(x))){
        return await navigateTo(mainUrl, {external: true})
    }

});

