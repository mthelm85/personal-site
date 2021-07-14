<template>
  <v-col>
    <v-row align="center" justify="center" class="fixed-height">
        <v-col align="left" justify="auto">
          <v-row>
            <v-text class="display-3">Hi! I'm Matt</v-text>
          </v-row>
          <v-row>
            <span class="subtitle-1">Data Scientist, Applied Statistician, Web Developer</span>
          </v-row>
        </v-col>
        <v-col align="center" justify="center" class="fixed-height">
          <v-hover
            v-slot="{ hover }"
            :disabled="hoverBool"
            >
            <v-scale-transition>
                <v-avatar
                  :size="hover ? 230 : 190"
                  class="transition-fast-in-fast-out"
                >
                  <v-img
                    :lazy-src="require('@/assets/calculus_lazy.jpg')"
                    :src="require('@/assets/profile.jpg')"
                    height="290px"
                    :aspect-ratio="13/16"
                    contain
                  ></v-img>
                </v-avatar>
            </v-scale-transition>
          </v-hover>
        </v-col>
    </v-row>
  </v-col>
</template>

<script>
  export default {
    data () {
      return {
        width: null
      }
    },

    computed: {
      hoverBool () {
        switch (this.$vuetify.breakpoint.name) {
          case 'xs': return true
          case 'sm': return true
          case 'md': return true
          case 'lg': return false
          case 'xl': return false
          default: return true
        }
      },
    },
  }
</script>
<style>
  .fixed-height {
    min-height: 270px;
    line-height: 270px;
  }
  a {
    text-decoration: none;
  }
</style>
