<template>
  <v-col cols="12">
    <v-row>
      <v-container fluid>
        <v-timeline>
        <v-timeline-item
          v-for="(year, i) in years"
          :key="i"
          :color="year.color"
        >
          <template v-slot:opposite>
            <span
              :class="`headline font-weight-bold ${year.color}--text`"
              v-text="year.year"
            ></span>
          </template>
          <div class="py-4">
            <h2 :class="`headline font-weight-light mb-4 ${year.color}--text`">
            {{ year.title }}
            </h2>
            <div class="change-color">
              {{ year.text }}
            </div>
          </div>
        </v-timeline-item>
      </v-timeline>
      </v-container>

    </v-row>
  </v-col>

</template>
<script>
  export default {
    data: () => ({
      years: [
        {
          color: 'red',
          year: '2018',
          title: 'Data Scientist',
          text: 'Began working as a Data Scientist under the Wage & Hour Division\'s national office.'
        },
        {
          color: 'orange',
          year: '2015',
          title: 'Master of Science Finance/Economics',
          text: 'Graduated with a Master of Science in Finance & Economics from West Texas A & M University (4.0 GPA 😃)'
        },
        {
          color: 'yellow',
          year: '2012',
          title: 'DOL',
          text: 'Began work at U.S. Department of Labor, Wage & Hour Division.'
        },
        {
          color: 'green',
          year: '2010',
          title: 'IRS',
          text: 'Started work at the Internal Revenue Service.'
        },
        {
          color: 'blue',
          year: '2009',
          title: 'Bachelor of Science Economics',
          text: 'Graduated with a Bachelor of Science in Economics from the University of West Florida.'
        },
      ],
    }),
  }
</script>
