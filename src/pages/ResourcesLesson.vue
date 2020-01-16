<template>
  <Lesson
    :isResources="true"
    :resources="resources" />
</template>

<script>
import router from '../router'
import Lesson from '../components/Lesson'
import { getTutorialByShortname } from '../utils/tutorials'

export default {
  components: {
    Lesson
  },
  props: {
    tutorialShortname: String
  },
  computed: {
    resources: function () {
      const tutorial = getTutorialByShortname(this.tutorialShortname)

      // If no tutorial was found, redirect to 404 page
      if (!tutorial) {
        router.replace({ name: '404' })

        return
      }

      return tutorial.resources
    }
  }
}
</script>
