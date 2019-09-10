<template>
    <v-toolbar fixed class="grey darken-3">
        <!-- <img src="../assets/RedoeMed.png" style="width:40px;height:50px;"> -->
        <v-toolbar-title class="mr-4">
            Contract Manager
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items class="hidden-sm-and-down">
            <v-btn flat dark
                v-if="$store.state.isUserLoggedIn"
                @click="navigateTo({name: 'HelloWorld'})">
                Home
            </v-btn>
            <v-btn flat dark
                v-if="$store.state.isUserLoggedIn"
                @click="navigateTo({name: 'Calendar'})">
                Calendar
            </v-btn>
            <v-btn flat dark
                v-if="$store.state.isUserLoggedIn"
                @click="navigateTo({name: 'Contracts'})">
                Contracts
            </v-btn>
            <v-btn flat dark
                v-if="$store.state.isUserLoggedIn"
                @click="navigateTo({name: 'Vendors'})">
                Vendors
            </v-btn>
            <v-btn flat dark
                v-if="$store.state.isUserLoggedIn"
                @click="navigateTo({name: 'Users'})">
                {{displayName}}
            </v-btn>
            <v-btn flat dark
                v-if="$store.state.isUserLoggedIn"
                @click="logout()">
                Logout
            </v-btn>
        </v-toolbar-items>
        <v-menu class="hidden-md-and-up" v-if="$store.state.isUserLoggedIn">
            <v-toolbar-side-icon slot="activator" id="menu"></v-toolbar-side-icon>
            <v-list>
                <v-list-tile @click="navigateTo({name: 'HelloWorld'})">
                    <v-list-tile-title>Home</v-list-tile-title>
                </v-list-tile>
                <v-list-tile @click="navigateTo({name: 'Calendar'})">
                    <v-list-tile-title>Calendar</v-list-tile-title>
                </v-list-tile>
                <v-list-tile @click="navigateTo({name: 'Contracts'})">
                    <v-list-tile-title>Contracts</v-list-tile-title>
                </v-list-tile>
                <v-list-tile @click="navigateTo({name: 'Vendors'})">
                     <v-list-tile-title>Vendors</v-list-tile-title>
                </v-list-tile>
                <v-list-tile @click="navigateTo({name: 'Users'})">
                    <v-list-tile-title>{{displayName}}</v-list-tile-title>
                </v-list-tile>
                <v-list-tile @click="logout()">
                    <v-list-tile-title>Logout</v-list-tile-title>
                </v-list-tile>
            </v-list>
        </v-menu>
    </v-toolbar>
</template>

<script>
/* eslint-disable */
export default {
    computed: {
        displayName () {
            return this.$store.state.user
        }
    }, 
    methods: {
        navigateTo (route) {
            this.$router.push(route)
        },
        logout () {
            this.$store.dispatch('setAdmin', null)
            this.$store.dispatch('setUser', 'Username')
            this.$store.dispatch('setToken', null)
            this.$store.dispatch('setAdminToken', null)
            this.$router.push({
                name: 'Login'
            })
        }
    }
}
</script>

<style scoped>
#menu {
    color: white;
}
</style>
