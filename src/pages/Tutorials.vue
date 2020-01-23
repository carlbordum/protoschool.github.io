<template>
  <div>
    <Header/>
    <section class="db">
      <h1 class="mw7 center ph2 mt5">Interactive Tutorials</h1>
      <p class="f4 fw5 lh-copy ma0 pv4 mw7 center ph2">
        Our interactive tutorials help you learn about the
        decentralized web by writing code and solving challenges.
      </p>
      <div class="mw7 center w100 tr">
        <ToggleButton   :value="true"
                        v-model="showCoding"
                        color="#69c4cd"
                        :sync="true"
                        :name="'includeCodingTutorials'"
                        :id="'includeCodingTutorials'"
                        :externalLabel="'Include Coding Tutorials'"
                        width="40"/>
      </div>
                    <!-- .navy { color: #0b3a53; }
                    .navy-muted { color: #244e66; }
                    .aqua { color: #69c4cd; }
                    .aqua-muted { color: #9ad4db; } -->

    </section>

    <template v-for="tutorial in (showCoding? allTutorials : codelessTutorials)">
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
import ToggleButton from '../components/ToggleButton.vue' // adapted locally from npm package 'vue-js-toggle-button'

export default {
  name: 'Tutorials',
  components: {
    Header,
    Tutorial,
    ToggleButton
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
      showCoding: true
    }
  }
}
</script>
