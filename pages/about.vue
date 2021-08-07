<template>
  <v-container class="text-center">
    <v-card flat min-height=600 outlined color="transparent">
      <v-tabs
        v-model="tab"
        icons-and-text
        :centered="!vertical"
        :vertical="vertical"
      >
        <v-tabs-slider></v-tabs-slider>

        <v-tab href="#tab-1" outlined color="transparent">
          Summary
          <v-icon>mdi-account</v-icon>
        </v-tab>

        <v-tab href="#tab-2" class="transparent">
          Programming
          <v-icon>mdi-code-braces</v-icon>
        </v-tab>

        <v-tab href="#tab-3">
          Contact
          <v-icon>mdi-email</v-icon>
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab" class="transparent">
        <v-tab-item
          v-for="i in 3"
          :key="i"
          :value="'tab-' + i"
        >
          <v-card outlined color="transparent">
            <v-card-text>{{ items[i-1].text }}</v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
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
            text: 'I\'m into data science, math, statistics, windsurfing, music, and Manchester United FC. I currently work as a Data Scientist at the U.S. Department of Labor where I lead and manage a diverse portfolio of projects that leverage a variety of statistical and machine learning techniques. In addition to my data science skills, I\'m a skilled web developer and software engineer.'
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

  computed: {
    vertical () {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs': return true
        case 'sm': return false
        case 'md': return false
        case 'lg': return false
        case 'xl': return false
        default: return true
      }
    },
  },
}
</script>
<style>
.transparent {
  background-color: transparent !important;
}
.v-tabs-bar {
  background-color: transparent !important;
}
</style>
