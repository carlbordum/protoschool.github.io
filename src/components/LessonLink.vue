<template>
  <router-link :to="to" class="link db pa3 bb b--white green hover-bg-washed-yellow">
    <div class="flex items-center">
      <div v-if="isResources" class="tc green ttu f6" style="min-width: 93px">Resources</div>
      <div v-else class="tc green ttu f6" style="min-width: 93px">Lesson {{lessonNumber}}</div>
      <div class="pr2" style="flexShrink: 0">
        <img v-if="getLessonValue('passed' + to)" src="../static/images/complete.svg" alt="complete" style="height: 1rem;"/>
        <img v-else-if="getLessonValue('cached' + to)" src="../static/images/in-progress.svg" alt="in progress" style="height: 1rem;"/>
        <img v-else src="../static/images/not-started.svg" alt="not yet started" style="height: 0.9rem;"/>
      </div>
      <div class="navy fw5 mw6">{{lesson.title}}</div>
      <img
        :src="lessonType.icon"
        :alt="lessonType.alt"
        style="height: 54px" />
    </div>
  </router-link>
</template>

<script>

import codeIcon from '../static/images/code.svg'
import readingIcon from '../static/images/reading.svg'
import multipleChoiceIcon from '../static/images/multiple_choice.svg'

export default {
  name: 'LessonLink',
  props: [
    'to',
    'lessonNumber',
    'lesson',
    'lessonId'
  ],
  computed: {
    isResources: function () {
      return this.to.split('/')[2] === 'resources'
    },
    lessonType: function() {
      if (this.lesson.types.includes('code')) {
        return { icon: codeIcon, alt: "coding icon" }
      } else if (this.lesson.types.includes('multiple-choice')) {
        return { icon: multipleChoiceIcon, alt: "multiple choice icon" }
      } else {
        return { icon: readingIcon, alt: "reading icon" }
      }
    }
  },
  methods: {
    getLessonValue: function (lessonKey) {
      return !!localStorage[lessonKey]
    }
  }
}
</script>
