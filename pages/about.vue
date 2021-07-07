<template>
  <v-container class="text-center">
    <v-card flat color="transparent">
      <v-tabs
        v-model="tab"
        background-color="transparent"
        icons-and-text
        dark
        :centered="width < 500 ? false : true"
        :vertical="width < 500 ? true : false"
      >
        <v-tabs-slider></v-tabs-slider>

        <v-tab href="#tab-1">
          Summary
          <v-icon>mdi-account</v-icon>
        </v-tab>

        <v-tab href="#tab-2">
          Programming
          <v-icon>mdi-code-braces</v-icon>
        </v-tab>

        <v-tab href="#tab-3">
          Contact
          <v-icon>mdi-email</v-icon>
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item
          v-for="i in 3"
          :key="i"
          :value="'tab-' + i"
        >
          <v-card flat color="background">
            <v-card-text class="fixed-height2">{{ items[i-1].text }}</v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
    <h3 class="change-color-link">
      <NuxtLink style="text-decoration: none; color: inherit;" to="/timeline">
        View My Timeline
      </NuxtLink>
    </h3>
  </v-container>
</template>


<script>
  export default {
    data () {
      return {
        tab: null,
        items: [
          {
            href: "#tab-0",
            title: "Recents",
            icon: "mdi-account",
            text: 'I\'m into data science, math, statistics, windsurfing, music, and Manchester United FC. I currently work as a Data Scientist at the U.S. Department of Labor where I lead and manage a diverse portfolio of projects that leverage statistical analysis and a variety of machine learning techniques. In addition to my data science skills, I\'m a skilled web developer and software engineer.'
          },
          {
            href: "#tab-1",
            title: "Programming Languages",
            icon: "mdi-code-braces",
            text: 'I prefer the Julia programming language for working with data, the MEVN stack (MongoDB, Express, Vue, Node) for web development, and Rust for everything else. I\'m always looking for better tools and I\'m eager to keep my programming skills sharp and up-to-date.                                                                                                                          '
          },
          {
            href: "#tab-2",
            title: "Contact",
            icon: "mdi-email",
            text: 'You can reach me at mthelm85@gmail.com                                                                                                                                                                                                                                                                                                                                                          '
          }
        ],
        width: null
    }
  },

  updated () {
    window.addEventListener('resize', this.handleResize())
    this.handleResize()
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize())
  },

  methods: {
    handleResize () {
      this.width = window.innerWidth
    }
  }
}
</script>
<style>
.fixed-height2 {
  min-height: 200px;
}
</style>
