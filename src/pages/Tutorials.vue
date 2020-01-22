<template>
  <div>
    <Header/>
    <section class="db">
      <h1 class="mw7 center ph2 mt5">Interactive Tutorials</h1>
      <p class="f4 fw5 lh-copy ma0 pv4 mw7 center ph2">
        Our interactive tutorials help you learn about the
        decentralized web by writing code and solving challenges.
      </p>
    </section>
    <template v-for="tutorial in allTutorials">
      <Tutorial :tutorial="tutorial" :key="tutorial.tutorialId" :tutorialId="tutorial.tutorialId" />
    </template>
  </div>
</template>

<script>
import Header from '../components/Header.vue'
import Tutorial from '../components/Tutorial.vue'
import coursesList from '../static/courses.json' // array of 4-digit tutorial IDs (strings)
import tutorialsList from '../static/tutorials.json' // object in which those 4-digit IDs are keys for tutorial objects

export default {
  name: 'Tutorials',
  components: {
    Header,
    Tutorial
  },
  computed: {
    allTutorials: () => coursesList.all.map(tutorialId => ({ ...tutorialsList[tutorialId], tutorialId }))
    // allTutorials: () => {
    //   let allTutorials = {}
    //   coursesList.all.forEach(function (tutorialId) {
    //     allTutorials[tutorialId] = tutorialsList[tutorialId]
    //   })
    //   return allTutorials
    // }
  },
  data: self => {
    return {
      tutorialsList
    }
  }
}
</script>
