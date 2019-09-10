import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import * as Cookies from 'js-cookie'

Vue.use(Vuex)

/* eslint-disable indent */
export default new Vuex.Store({
    strict: true,
    plugins: [
        createPersistedState({
            storage: {
                getItem: key => Cookies.get(key),
                // store the state in a cookie
                setItem: (key, value) =>
                    // expires in one day
                    Cookies.set(key, value, { expires: 0.5, secure: false }),
                removeItem: key => Cookies.remove(key)
            }
        })
    ],
    // with the way vue works the store must go through the actions then mutations to set the values of the state
    state: {
        admin: null,
        user: 'Username',
        token: null,
        adminToken: null,
        isUserLoggedIn: true
    },
    mutations: {
        setAdmin (state, admin) {
            state.admin = admin
        },
        setUser (state, user) {
            state.user = user
        },
        setToken (state, token) {
            state.token = token
            // if (token) {
            //     state.isUserLoggedIn = true
            // } else {
            //     state.isUserLoggedIn = false
            // }
            state.isUserLoggedIn = true
        },
        setAdminToken (state, adminToken) {
            state.adminToken = adminToken
        }
    },
    actions: {
        setAdmin ({commit}, admin) {
            commit('setAdmin', admin)
        },
        setUser ({commit}, user) {
            commit('setUser', user)
        },
        setToken ({commit}, token) {
            commit('setToken', token)
        },
        setAdminToken ({commit}, adminToken) {
            commit('setAdminToken', adminToken)
        }
    },
    getters: {
        getStatus: (state) => {
            return state.isUserLoggedIn
        },
        isAdmin: (state) => {
            return state.admin
        }
    }
})
