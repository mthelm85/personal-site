<template>
  <v-app>
    <v-app-bar
      elevation=24
      app
    >
    <v-app-bar-nav-icon color="accent" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-spacer></v-spacer>
        <v-btn
          icon
          href="https://github.com/mthelm85/"
          target="_blank"
        >
          <v-icon color="accent">mdi-github</v-icon>
        </v-btn>
        <v-btn
          v-if="webShareSupported"
          icon
          @click="share"
        >
          <v-icon color="accent">mdi-share-variant</v-icon>
        </v-btn>
    </v-app-bar>
    <v-navigation-drawer
        v-model="drawer"
        fixed
        temporary
        bottom
        app
      >
      <v-list
        v-for="(link,i) in links"
        :key="i"
        nav
        dense
      >
        <NuxtLink :to="link.to">
          <v-list-item class="mx-0 px-0" ripple>
            <v-list-item-icon>
              <v-icon color="accent">{{ link.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title class="accent--text">
              {{ link.name }}
            </v-list-item-title>
          </v-list-item>
        </NuxtLink>
      </v-list>
      </v-navigation-drawer>
    <v-main>
      <v-container align="center" justify="center" fill-height>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer
      inset
      app
      class="justify-center pl-0"
    >
      <v-col cols="12" class="text-center accent--text">&copy; {{ new Date().getFullYear() }}</v-col>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      drawer: false,
      group: null,
      links: [
        { name: 'Home', to: '/', icon: 'mdi-home-account' },
        { name: 'About', to: '/about', icon: 'mdi-information-variant' },
        { name: 'Timeline', to: '/timeline', icon: 'mdi-timeline-text-outline' },
        { name: 'Showcase', to: '/showcase', icon: 'mdi-star-face' }
      ],
      title: 'Matt Helm'
    }
  },

  computed: {
    webShareSupported () {
      return navigator.share
    }
  },

    watch: {
      group () {
        this.drawer = false
      },
    },

  methods: {
    share () {
      navigator.share({
        title: 'Matt Helm',
        text: 'I thought you might be interested in learning about Matt. He\'s a data scientist, applied statistician, and developer!',
        url: 'https://www.matthelm.pro'
      })
    }
  }
}
</script>
<style>
/* .v-slide-group__wrapper {
  display: flex !important;
  justify-content: center !important;
} */
</style>
