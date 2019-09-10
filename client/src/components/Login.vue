<template>
    <v-container>
        <v-layout align-center justify-center column fill-height id="login">
            <v-flex grow>
                <div class="white elevation-3">
                    <v-toolbar flat dense class="green darken-1">
                        <v-toolbar-title>Welcome!</v-toolbar-title>
                    </v-toolbar>
                    <div class="pl-4 pr-4 pt-2 pb-2">
                        <v-text-field
                            label="Username"
                            :rules="[rules.required]"
                            color="grey darken-3"
                            v-model="email"
                        ></v-text-field>
                        <v-text-field
                            v-model="password"
                            :append-icon="show ? 'visibility' : 'visibility_off'"
                            :rules="[rules.required]"
                            :type="show ? 'text' : 'password'"
                            name="input-10-1"
                            label="Password"
                            color="grey darken-3"
                            @click:append="show = !show"
                            @keypress.enter="login"
                        ></v-text-field>
                        <div class="error" v-html="error"/>
                        <v-btn class="success"
                            color="green darken-1"
                            :loading="loading"
                            :disabled="loading"
                            @click="login()">
                            Login
                        </v-btn>
                    </div>
                </div>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
/* eslint-disable */
import authenticationService from '@/services/authenticationService'
export default {
    data () {
        return {
            email: '',
            password: '',
            error: null,
            show: false,
            loader: null,
            loading: false,
            rules: {
                required: value => !!value || 'Required.',
            }
        }
    },
    methods: {
        async login () {
            this.loading = true
            try {
                const response = await authenticationService.login({
                    email: this.email,
                    password: this.password
                })
                // send the users information to the store which manages the state
                this.$store.dispatch('setAdmin', response.data.admin)
                this.$store.dispatch('setUser', response.data.user)
                this.$store.dispatch('setToken', response.data.token)
                this.$store.dispatch('setAdminToken', response.data.adminToken)
                this.$router.push({
                    name: 'HelloWorld'
                })
                setTimeout(() => {
                    this.loading = false
                }, 1000)
            }
            catch (error) {
                this.error = error.response.data.error
                setTimeout(() => {
                    this.loading = false
                }, 1000)
            }
        }
    }
}
</script>

<style scoped>
    .error {
        color: white !important;
        margin-top: 2%;
    }
    #login {
        margin-top: 12%;
    }
    .custom-loader {
    animation: loader 1s infinite;
    display: flex;
    }
    @-moz-keyframes loader {
        from {
        transform: rotate(0);
        }
        to {
        transform: rotate(360deg);
        }
    }
    @-webkit-keyframes loader {
        from {
        transform: rotate(0);
        }
        to {
        transform: rotate(360deg);
        }
    }
    @-o-keyframes loader {
        from {
        transform: rotate(0);
        }
        to {
        transform: rotate(360deg);
        }
    }
    @keyframes loader {
        from {
        transform: rotate(0);
        }
        to {
        transform: rotate(360deg);
        }
    }
</style>
