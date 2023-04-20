<template>
  <v-container justify="center" align="center">
    <v-card
        v-for="(slide, i) in slides"
        :key="i"
        class="mx-auto mb-6"
        rounded
        max-width=960

    >
        <v-img
        class="white--text align-center justify-end"
        :src="slide.src"
        :lazy-src="slide.lazySrc"
        max-height=540
        >
        <v-card-title class="text-md-h2">{{ slide.title }}</v-card-title>
        </v-img>

        <v-card-subtitle class="pb-0">
        About This Project
        </v-card-subtitle>

        <v-card-text class="text--primary">
            <span>{{ slide.description }}</span>
        </v-card-text>
        <v-card-subtitle class="pb-0">
            Tools & Techniques
        </v-card-subtitle>

        <v-card-text class="text--primary">
            <span>{{ slide.tools }}</span>
        </v-card-text>
        <v-card-actions>
        <v-btn
            color="accent"
            text
            :href="slide.link"
            target="_blank"
        >
            View Project
        </v-btn>

        <!-- <v-btn
            color="primary"
            text
            :href="slide.linkInteractive"
            target="_blank"
        >
            Interactive
        </v-btn> -->
        </v-card-actions>
    </v-card>
  </v-container>

</template>

<script>
export default {
  data () {
      return {
        slides: [
          {
            title: 'Bayesian Regression With an Ordered Categorical Predictor Variable',
            description: 'Bayesian regression analysis of the incremental effects of educational attainment on income.',
            tools: 'Julia and the Turing probabilistic programming language.',
            link: 'https://forem.julialang.org/mthelm85/bayesian-regression-with-an-ordered-categorical-predictor-variable-ejc',
            // linkInteractive: null,
            src: require('@/assets/money.jpg'),
            lazySrc: require('@/assets/calculus_lazy.jpg')
          },
          {
            title: 'Kernel Density Estimation',
            description: 'A brief primer on Kernel Density Estimation.',
            tools: 'JavaScript running in an Observable notebook.',
            link: 'https://observablehq.com/d/bf068f6a5c4da2ce',
            // linkInteractive: null,
            src: require('@/assets/bell_curve.jpg'),
            lazySrc: require('@/assets/calculus_lazy.jpg')
          },
          {
            title: 'County Clustering',
            description: 'Clusters U.S. counties within a state according to industrial similarities.',
            tools: 'Pluto notebook powered by the Julia programming language, running on Binder. Leverages the k-medoids and fuzzy c-means clustering algorithms. For the interactive version, click the \'Edit or run this notebook\' option after opening.',
            link: 'https://www.matthelm.pro/clusteringStatic.html',
            // linkInteractive: null,
            src: require('@/assets/globe.jpg'),
            lazySrc: require('@/assets/calculus_lazy.jpg')
          },
          {
            title: 'Calculus',
            description: 'This is an interactive notebook that clearly demonstrates the fundamental concepts of calculus. Learn and understand limits, continuity, derivatives and integrals in 30 minutes or less! For the interactive version, click the \'Edit or run this notebook\' option after opening.',
            tools: 'Pluto notebook powered by the Julia programming language, running on Binder.',
            link: 'https://www.matthelm.pro/calculusStatic.html',
            // linkInteractive: null,
            src: require('@/assets/calculus.jpg'),
            lazySrc: require('@/assets/calculus_lazy.jpg')
          },
          {
            title: 'Linear Algebra Part I',
            description: 'Learn about vectors and scalars. For the interactive version, click the \'Edit or run this notebook\' option after opening.',
            tools: 'Pluto notebook powered by the Julia programming language, running on Binder.',
            link: 'https://www.matthelm.pro/linAlgStatic.html',
            // linkInteractive: null,
            src: require('@/assets/matrix.jpg'),
            lazySrc: require('@/assets/calculus_lazy.jpg')
          },
          {
            title: 'Linear Algebra Part II',
            description: 'Learn about matrices. For the interactive version, click the \'Edit or run this notebook\' option after opening.',
            tools: 'Pluto notebook powered by the Julia programming language, running on Binder.',    
            link: 'https://www.matthelm.pro/linAlg2Static.html',
            // linkInteractive: null,
            src: require('@/assets/matrix.jpg'),
            lazySrc: require('@/assets/calculus_lazy.jpg')
          },
          {
            title: 'The Travelling Salesman Game',
            description: 'The travelling salesman problem, as an arcade game.',
            tools: 'JavaScript, HTML, Phaser.js game engine. Each level is generated randomly and then solved with simulated annealing. Calculates Euclidean distance between points.',
            link: 'https://mthelm85.github.io/travelling-salesman-game/',
            src: require('@/assets/roadmap.jpg'),
            lazySrc: require('@/assets/calculus_lazy.jpg')
          },
          {
            title: 'County Business Patterns',
            description: 'Interactive tool for exploring the U.S. Census Bureau\'s County Business Patterns data set.',
            tools: 'Built with Vue.js and Vuetify. Accepts user inputs to formulate calls to the Census CBP API and then renders a choropleth map with Leaflet.js.',    
            link: 'https://census-cbp.herokuapp.com/',
            // linkInteractive: 'https://census-cbp.herokuapp.com/',
            src: require('@/assets/census.jpg'),
            lazySrc: require('@/assets/calculus_lazy.jpg')
          },
            {
            title: 'Pensacola Sail Club',
            description: 'Windsurfing club website.',
            tools: 'Built with Vue.js and Vuetify. Displays a Leaflet.js map with the Windy.com plugin. Fetches local wind/gust data from the openweathermap.org API and displays in a custom Chart.js chart.',    
            link: 'https://www.pensacolasail.club/',
            // linkInteractive: 'https://www.pensacolasail.club/',
            src: require('@/assets/windsurf.jpg'),
            lazySrc: require('@/assets/calculus_lazy.jpg')
          },
        ],
      }
    },

    // async mounted () {
    //   this.slides[0].linkInteractive = await this.linkCreator('https://github.com/mthelm85/CountyClusteringShowcase/blob/main/notebook.jl')
    //   this.slides[1].linkInteractive = await this.linkCreator('https://github.com/mthelm85/CalculusInANutshell/blob/main/notebook.jl')
    //   this.slides[2].linkInteractive = await this.linkCreator('https://github.com/mthelm85/LinearAlgebraInANutshell/blob/main/notebook.jl')
    //   this.slides[3].linkInteractive = await this.linkCreator('https://github.com/mthelm85/LinearAlgebraInANutshell/blob/main/notebook2.jl')
    // },

    methods: {
      async linkCreator (link) {
        const latestTag = "v0.15.1"
        const linky = (await this.processPathOrUrl(link)).pathOrUrl
        return `https://binder.plutojl.org/${await latestTag}/open?url=${encodeURIComponent(encodeURIComponent(linky))}`
      },
      gistNormalizer (str) {
        return str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[^a-z1-9]/g, "")
      },
      async processPathOrUrl (pathOrUrl) {
        try {
            const u = new URL(pathOrUrl)
            if (u.host === "gist.github.com") {
                const parts = u.pathname.substring(1).split("/")
                const gistId = parts[1]
                const gist = await (
                    await fetch(`https://api.github.com/gists/${gistId}`, {
                        headers: { Accept: "application/vnd.github.v3+json" },
                    })
                ).json()

                const files = Object.values(gist.files)

                const selected = files.find((f) => this.gistNormalizer("#file-" + f.filename) === this.gistNormalizer(u.hash))
                if (selected != null) {
                    return {
                      type: "url",
                      pathOrUrl: selected.raw_url
                    }
                }

                return {
                  type: "url",
                  pathOrUrl: files[0].raw_url
                }
            } else if (u.host === "github.com") {
              return {
                type: "url",
                pathOrUrl: u.href.replace(/\/\/github\.com/, '//raw.githubusercontent.com').replace(/\/blob\//, '/').replace(/\/raw\//, '/'),
              }
            }
            return {
              type: "url",
              pathOrUrl: u.href
            }
        } catch (ex) {
            return {
              type: "url",
              pathOrUrl
            }
        }
      }
    }
}
</script>

<style lang="css" scoped>
</style>
