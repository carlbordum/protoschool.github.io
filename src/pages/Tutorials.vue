<template>
  <div>
    <Header/>
    <section class="db">
      <h1 class="mw7 center ph2 mt5">Interactive Tutorials</h1>
      <p class="f4 fw5 lh-copy ma0 pv4 mw7 center ph2">
        Our interactive tutorials help you learn about the
        decentralized web by writing code and solving challenges.
      </p>
        <span v-if="filterOutCoding" @click="toggleFilter" class="textLink ">View All Tutorials</span>
        <span v-else @click="toggleFilter" class="textLink ">Hide Coding Tutorials</span>
    </section>

    <template v-for="tutorial in (filterOutCoding? codelessTutorials : allTutorials)">
      <Tutorial :tutorial="tutorial" :key="tutorial.tutorialId" :tutorialId="tutorial.tutorialId" />
    </template>
  </div>
</template>

<script>
import Header from '../components/Header.vue'
import Tutorial from '../components/Tutorial.vue'
import coursesList from '../static/courses.json' // array of 4-digit tutorial IDs (strings)
import tutorialsList from '../static/tutorials.json' // object in which those 4-digit IDs are keys for tutorial objects
import { getTutorialType } from '../utils/tutorials'

export default {
  name: 'Tutorials',
  components: {
    Header,
    Tutorial
  },
  computed: {
    allTutorials: () => coursesList.all.map(tutorialId => ({ ...tutorialsList[tutorialId], tutorialId })),
    codelessTutorials: function () {
      return this.allTutorials.filter(tutorial => (getTutorialType(tutorial.tutorialId) !== 'code'))
    }
  },
  data: self => {
    return {
      tutorialsList,
      filterOutCoding: false
    }
  },
  methods: {
    toggleFilter: function () {
      this.filterOutCoding = !this.filterOutCoding
    }
  }
}
</script>
