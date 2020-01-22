<template>
  <img
    :src="type.icon"
    :alt="type.alt"/>
</template>

<script>
import { getTutorialType, getLessonType } from '../utils/tutorials'
import codeIcon from '../static/images/code.svg'
import textIcon from '../static/images/text.svg'
import multipleChoiceIcon from '../static/images/multiple_choice.svg'
import resourcesIcon from '../static/images/resources.svg'

export default {
  name: 'TypeIcon',
  props: {
    tutorialId: {
      type: String,
      required: true
    },
    lessonId: {
      type: String,
      default: null
    }
  },
  computed: {
    type: function () {
      const type = this.lessonId
        ? getLessonType(this.tutorialId, this.lessonId)
        : getTutorialType(this.tutorialId)

      switch (type) {
        case 'code':
          return { icon: codeIcon, alt: 'coding icon' }
        case 'multiple-choice':
          return { icon: multipleChoiceIcon, alt: 'multiple choice icon' }
        case 'resources':
          return { icon: resourcesIcon, alt: 'resources icon' }
        default:
          return { icon: textIcon, alt: 'text icon' }
      }
    }
  }
}

</script>

<style scoped>

</style>
