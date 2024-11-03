<template>
    <div class="flex w-full">
        <client-only>
            <div class="w-3/12">
                <EditorTemplate></EditorTemplate>
            </div>
            <div class="w-9/12">
                <EditorView></EditorView>
            </div>
        </client-only>
    </div>
</template>
<script setup lang="ts">
import eventBus from '~/assets/js/lib/eventBus'
import { getCookie, synchronizationUserState, getLocalEncrpt } from "~/assets/js/utils/tools"

const user = ref({"email": ""})

const initLocalUser = async () => {
    const res = getCookie("__user")
    if (res) {
        const userObject = JSON.parse(decodeURIComponent(res))
        if (userObject) {
            user.value = userObject
        }
        useState("user", () => {
            return userObject
        })
    }
    refreshState()
}
const refreshState = async () => {
    await synchronizationUserState()
    const member = getLocalEncrpt("__r")
    if (member) {
        const obj = JSON.parse(decodeURIComponent(member))
        useState("member", () => {
            return obj
        })
    }
}
eventBus.on('member', (obj) => {
    member.value = obj
})
if (process.client) {
    initLocalUser()
}

useHead({
    script: [
        {
            src: '/js/konva@8.4.0.min.js',
        }
    ]
})
</script>
