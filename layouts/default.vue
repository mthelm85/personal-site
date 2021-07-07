<template>
  <v-app dark>
    <v-app-bar
      color="secondary"
      elevation=24
      app
    >
    <v-list
      v-for="(link,i) in links"
      :key="i"
      nav
      dense
      color="secondary"
    >
      <NuxtLink :to="link.to" style="text-decoration: none; color: inherit;">
        <v-list-item class="mx-0 px-0">
          <v-list-item-title class="change-color menu-text">
            {{ link.name }}
          </v-list-item-title>
        </v-list-item>
      </NuxtLink>
    </v-list>
    </v-app-bar>
    <v-main>
      <v-container align="center" fill-height class="px-6">
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer
      color="secondary"
      app
    >
      <v-col cols="12" class="text-center" style="color: #d6bc94">&copy; {{ new Date().getFullYear() }}</v-col>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      links: [
        { name: 'Home', to: '/' },
        { name: 'About', to: '/about' },
        { name: 'Timeline', to: '/timeline' },
        { name: 'Showcase', to: '/showcase' }
      ],
      title: 'Matt Helm'
    }
  }
}
</script>
<style>
.menu-text {
  font-family: 'Permanent Marker' !important;
  font-size: 22px !important;
}
</style>
