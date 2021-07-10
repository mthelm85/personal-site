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
            :lazy-src="slide.lazySrc"
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
            link: 'https://nextjournal.com/matthelm/clustering-counties-within-a-state-based-on-industry-characteristics',
            src: require('@/assets/globe.jpg'),
            lazySrc: require('@/assets/globe_lazy.jpg')
          },
          {
            title: 'Calculus',
            description: 'Learn calculus in 30 minutes',
            link: null,
            src: require('@/assets/calculus.jpg'),
            lazySrc: require('@/assets/calculus_lazy.jpg')
          },
          {
            title: 'Linear Algebra',
            description: 'Linear algebra in a nuthsell',
            link: 'https://mybinder.org/v2/gh/mthelm85/LinearAlgebraInANutshell/main?urlpath=pluto/open?path=/home/jovyan/notebooks/notebook.jl',
            src: require('@/assets/matrix.jpg'),
            lazySrc: require('@/assets/calculus_lazy.jpg')
          },
        ],
      }
    },

    async mounted () {
      this.slides[1].link = await this.linkCreator('https://github.com/mthelm85/CalculusInANutshell/blob/main/notebook.jl')
      this.slides[2].link = await this.linkCreator('https://github.com/mthelm85/LinearAlgebraInANutshell/blob/main/notebook.jl')
    },

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
