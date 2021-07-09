<template>
  <v-row justify="center" align="center">
    <v-card elevation=20>
      <v-carousel
          cycle
          interval=6000
          height="400"
          hide-delimiter-background
          show-arrows-on-hover
        >
          <v-carousel-item
            v-for="(slide, i) in slides"
            :key="i"
            :href="slide.link"
            target="_blank"
            eager
          >
          <v-img
            :src="slide.src"
            height="100%"
            eager
            rounded
          >
          <v-row class="text-center fill-height" align="center" justify="center">
            <v-col>
              <span class="display-1">{{ slide.title }}</span>
            </v-col>
            <v-col>
              {{ slide.description }}
            </v-col>
          </v-row>
          </v-img>
          </v-carousel-item>
        </v-carousel>
    </v-card>
  </v-row>

</template>

<script>
export default {
  data () {
      return {
        colors: [
          'indigo',
          'warning',
          'pink darken-2'
        ],
        slides: [
          {
            title: 'County Clustering',
            description: 'Cluster U.S. counties according to industrial similarities',
            link: 'https://nextjournal.com/matthelm/clustering-counties-within-a-state-based-on-industry-characteristics?token=3mGE1RBypxiHdcg5s8fUwc',
            src: require('@/assets/globe.jpg')
          },
          {
            title: 'Calculus',
            description: 'Learn calculus in 30 minutes',
            link: 'https://github.com/mthelm85/CalculusInANutshell',
            src: require('@/assets/calculus.jpg')
          },
          {
            title: 'Linear Algebra',
            description: 'Linear algebra in a nuthsell',
            link: 'https://github.com/mthelm85/CalculusInANutshell',
            src: require('@/assets/matrix.jpg')
          },
        ],
      }
    },
}
</script>

<style lang="css" scoped>
</style>
