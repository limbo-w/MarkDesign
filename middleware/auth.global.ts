export default defineNuxtRouteMiddleware((to, from) => {
    const user = useCookie('__user')
    if (to.name == 'editor') {
        if (!user.value || !user.value.token) {
            return navigateTo('/sign-in')
        }
    }
})
