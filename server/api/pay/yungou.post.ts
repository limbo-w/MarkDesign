import { onYungouosHook } from '../../service/av'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const result = await onYungouosHook(body)
    return result
})
