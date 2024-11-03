import { getItemsByTitle } from '../../service/av'

export default defineEventHandler(async (event) => {
    const query = await getQuery(event)
    query["table"] = "Material"
    return getItemsByTitle(query)
})
