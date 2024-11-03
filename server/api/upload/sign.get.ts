import {getSign} from '../../service/qiniu'

export default defineEventHandler(async (event) => {
    return getSign(event)
})
