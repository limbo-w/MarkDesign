import { getLocalEncrpt } from "@/assets/js/utils/tools"
export const useMember = () => {
    const member = getLocalEncrpt("__r")
    return useState('member', () => member)
}
