<template>
  <div id="app">
    <v-app>
      <PageHeader/>
      <main id="main">
        <v-container fluid>
          <router-view/>
        </v-container>
      </main>
      <PageFooter/>
    </v-app>
  </div>
</template>

<script>
import PageHeader from '@/components/Header.vue'
import PageFooter from '@/components/Footer.vue'
export default {
  name: 'App',
  components: {
    PageHeader,
    PageFooter
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#main {
  margin-top: 50px;
  margin-bottom: 85px;
}
.material-icons {
  display: -webkit-inline-box;
}
.v-toolbar__title {
  color: white;
}
.toolbar__title {
  color: white;
}
/* Width */
::-webkit-scrollbar {
  width: 10px;
}
/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
/* Handle */
::-webkit-scrollbar-thumb {
  background:#616161;
}
/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
