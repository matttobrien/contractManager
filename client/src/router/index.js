import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Login from '@/components/Login'
import Contracts from '@/components/Contracts'
import Calendar from '@/components/Calendar'
import Vendors from '@/components/Vendors'
import Users from '@/components/Users'
// import Store from '@/store/store'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
      // beforeEnter: (to, from, next) => {
      //   if (Store.getters.getStatus) {
      //     next()
      //   } else {
      //     next('/login')
      //   }
      // }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/contracts',
      name: 'Contracts',
      component: Contracts
      // beforeEnter: (to, from, next) => {
      //   if (Store.getters.getStatus) {
      //     next()
      //   } else {
      //     next('/login')
      //   }
      // }
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: Calendar
      // beforeEnter: (to, from, next) => {
      //   if (Store.getters.getStatus) {
      //     next()
      //   } else {
      //     next('/login')
      //   }
      // }
    },
    {
      path: '/vendors',
      name: 'Vendors',
      component: Vendors
      // beforeEnter: (to, from, next) => {
      //   if (Store.getters.getStatus) {
      //     next()
      //   } else {
      //     next('/login')
      //   }
      // }
    },
    {
      path: '/users',
      name: 'Users',
      component: Users
      // beforeEnter: (to, from, next) => {
      //   if (Store.getters.getStatus && Store.getters.isAdmin) {
      //     next()
      //   }
      // }
    }
  ]
})
