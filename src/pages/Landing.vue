<template>
  <div>
    <Header />
    <Tutorial :tutorial="tutorial" isLanding />
  </div>
</template>

<script>
import Header from '../components/Header.vue'
import Tutorial from '../components/Tutorial.vue'
import { getTutorialByShortname } from '../utils/tutorials'
import router from '../router'

export default {
  components: {
    Header,
    Tutorial
  },
  props: {
    tutorialShortname: String
  },
  computed: {
    tutorial: function () {
      const tutorial = getTutorialByShortname(this.tutorialShortname)

      // If no tutorial was found, redirect to 404 page
      if (!tutorial) {
        router.replace({ name: '404' })
        return
      }

      return tutorial
    }
  }
}
</script>
