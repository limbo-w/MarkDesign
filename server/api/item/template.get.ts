import { getItemsByTitle, getItemsByTag } from '../../service/av'

export default defineEventHandler(async (event) => {
    const query = await getQuery(event)
    query["table"] = "Template"
    if (query.tag) {
        return getItemsByTag(query)
    } else {
        return getItemsByTitle(query)

    }
})
