const SET_USER = 'SET_USER'
const SET_MEMBER = 'SET_MEMBER'
export default {
    namespaced: true,
    state: {
        username: {},
        pageconfig: initConfig
    },

    getters: {
        getUser (state) {
            return state.user
        },
        getMember (state) {
            return state.member
        }
    },

    mutations: {
        [SET_USER]: (state, user)=>{
            state.user = user
        },
        [SET_MEMBER]: (state, member)=>{
            state.member = member
        }
    },

    actions: {
        async setUser ({dispatch, commit, getters}, data) {
            return new Promise((resolve, reject) => {
                alert(data)
                commit('SET_USER', data)
                resolve(data)
            })
        },
        async setMember ({dispatch, commit, getters}, data) {
            return new Promise((resolve, reject) => {
                commit('SET_MEMBER', data)
                resolve(data)
            })
        }
    },
}
