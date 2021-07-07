<template>
  <v-col cols="12">
    <v-row align="center" justify="center" class="fixed-height">
        <v-col cols="m-6" align="left" justify="auto" class="change-color">
          <v-row>
            <v-text class="display-3">Hi! I'm Matt</v-text>
          </v-row>
          <v-row>
            <v-text class="subtitle-1">Data Scientist, Applied Statistician, Web Developer</v-text>
          </v-row>
        </v-col>
        <v-col cols="m-6" align="center" justify="center" class="fixed-height">
          <v-hover
            v-slot="{ hover }"
            >
            <v-scale-transition>
                <v-avatar
                  :size="hover ? 230 : 190"
                  class="transition-fast-in-fast-out"
                >
                  <v-img
                    :src="require('@/assets/profile.jpg')"
                    height="290px"
                    :aspect-ratio="13/16"
                    contain
                    eager
                  ></v-img>
                </v-avatar>
            </v-scale-transition>
          </v-hover>
        </v-col>
    </v-row>
    <v-row align="center" justify="center">
      <h1 class="change-color-link">
        <NuxtLink style="text-decoration: none; color: inherit;" to="/about">
          Learn More
        </NuxtLink>
      </h1>
    </v-row>
  </v-col>
</template>

<script>
  export default {
  }
</script>
<style>
  .fixed-height {
    min-height: 270px;
    line-height: 270px;
  }
  .change-color {
    color: #d6bc94;
  }
  .change-color:hover {
    color: #fff;
  }
  .change-color-link {
    color: #d6bc94;
  }
  .change-color-link:hover {
    color: #7d521a;
  }
</style>
