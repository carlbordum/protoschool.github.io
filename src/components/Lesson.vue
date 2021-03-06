<template>
  <div :class="{'overflow-hidden': expandExercise}">
    <Header/>
    <div class="container center-l mw7-l ph2">
      <section class="mw7 center mt3 pa3">
        <Breadcrumbs
          :isResources="isResources"
          :tutorialShortname="tutorialShortname"
          :lessonNumber="lessonNumber"
          :lessonsInTutorial="lessonsInTutorial"
          :lessonPassed="lessonPassed" />
        <CongratulationsCallout
            v-if="isResources && isTutorialPassed"
            :tutorial="tutorial"
            class="mv4"
        />
        <h1>{{isResources ? 'Resources' : lessonTitle}}</h1>
        <Concepts v-if="concepts" :parsedConcepts="parsedConcepts" />
        <Resources v-if="isResources" :data="resources" />
        <div v-else class="lesson-text lh-copy" v-html="parsedText"></div>
      </section>
      <section v-if="exercise || isMultipleChoiceLesson" :class="{expand: expandExercise}" class="exercise center pa3 ph4-l flex flex-column">
        <div class="flex-none">
          <Progress
            :isMultipleChoiceLesson="isMultipleChoiceLesson"
            :lessonPassed="lessonPassed"
            :cachedChoice="cachedChoice"
            :cachedCode="cachedCode"
            :cachedStateMsg="cachedStateMsg"
            :expandExercise="expandExercise"
            :toggleExpandExercise="toggleExpandExercise" />
          <div v-html="parsedExercise" class='lh-copy' />
          <FileUpload
            v-if="isFileLesson"
            :onFileClick="onFileClick"
            :onFileDrop="onFileDrop"
            :resetFileUpload="resetFileUpload"
            :uploadedFiles="uploadedFiles" />
          <CodeEditor
            v-if="exercise"
            :isFileLesson="isFileLesson"
            :editorReady="editorReady"
            :code="code"
            :solution="solution"
            :cachedCode="cachedCode"
            :onMounted="onMounted"
            :onCodeChange="onCodeChange"
            :resetCode="resetCode"
            :expandExercise="expandExercise"
            :cyReplaceWithSolution="cyReplaceWithSolution" />
          <Quiz
            v-if="isMultipleChoiceLesson"
            :question="this.question"
            :choices="this.choices"
            :selected="choice"
            @handleChoice="handleRadioChoice" />
        </div>
        <div class='flex-none'>
          <Output
            v-if="output.test"
            :output="output"
            :isFileLesson="isFileLesson"
            :lessonPassed="lessonPassed"
            :parseData="parseData" />
          <Info
            v-else-if="exercise && !isSubmitting"
            :showUploadInfo="showUploadInfo"
            :isFileLesson="isFileLesson" />
        </div>
      </section>
      <Validator
        :exercise="exercise"
        :isFileLesson="isFileLesson"
        :isMultipleChoiceLesson="isMultipleChoiceLesson"
        :uploadedFiles="uploadedFiles"
        :lessonPassed="lessonPassed"
        :output="output.test"
        :isResources="isResources"
        :nextLessonIsResources="nextLessonIsResources"
        :lessonNumber="lessonNumber"
        :lessonsInTutorial="lessonsInTutorial"
        :expandExercise="expandExercise"
        :isSubmitting="isSubmitting"
        :run="run"
        :next="next"
        :tutorialMenu="tutorialMenu" />
    </div>
    <footer class="mt4 ph2 ph3-ns bg-navy white">
      <div v-if="isResources" class="mw7 center">
        <p>How did you feel about this tutorial? We'd love to hear your thoughts and suggestions for improvement! Please <a :href="tutorialIssueUrl" target="_blank">share your feedback</a>.</p>
      </div>
      <div v-else class="mw7 center">
        <p>Feeling stuck? We'd love to hear what's confusing so we can improve this lesson. Please <a :href="lessonIssueUrl" target="_blank">share your questions and feedback</a>.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import 'highlight.js/styles/github.css'
import Vue from 'vue'
import CID from 'cids'
import marked from 'marked'
import pTimeout from 'p-timeout'
import newGithubIssueUrl from 'new-github-issue-url'

import Header from './Header.vue'
import Quiz from './Quiz.vue'
import Resources from './Resources.vue'
import Breadcrumbs from './Breadcrumbs.vue'
import Progress from './Progress.vue'
import Concepts from './Concepts.vue'
import FileUpload from './FileUpload.vue'
import CodeEditor from './CodeEditor.vue'
import Output from './Output.vue'
import Info from './Info.vue'
import Validator from './Validator.vue'
import CongratulationsCallout from './CongratulationsCallout.vue'
import { EVENTS } from '../static/countly'
import { deriveShortname } from '../utils/paths'
import { getCurrentTutorial, isTutorialPassed } from '../utils/tutorials'
import tutorialsList from '../static/tutorials.json'

const MAX_EXEC_TIMEOUT = 5000

const hljs = require('highlight.js/lib/highlight.js')
hljs.registerLanguage('js', require('highlight.js/lib/languages/javascript'))
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
hljs.registerLanguage('json', require('highlight.js/lib/languages/json'))

const renderer = new marked.Renderer()
renderer.link = function (href, title, text) {
  const link = marked.Renderer.prototype.link.call(this, href, title, text)
  return link.replace('<a', '<a target=\'_blank\' ')
}

marked.setOptions({
  renderer: renderer,
  highlight: code => {
    return hljs.highlightAuto(code).value
  }
})

class SyntaxError extends Error {
  toString () {
    return `SyntaxError: ${this.message}`
  }
}

const _eval = async (text, ipfs, modules = {}, args = []) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return new Error('Please submit a solution.')
  }

  let fn
  try {
    // eslint-disable-next-line
    fn = new Function('ipfs', 'require', text)
  } catch (err) {
    return new SyntaxError(err.message, err)
  }

  const require = name => {
    if (!modules[name]) throw new Error(`Cannot find modules: ${name}`)
    return modules[name]
  }

  let result

  try {
    result = await pTimeout(fn(ipfs, require)(...args), MAX_EXEC_TIMEOUT).catch((err) => {
      if (err.name === 'TimeoutError') {
        err.message = 'Your code took too long to execute. This could be the result of trying to fetch data that\'s not available on the IPFS network. Take a close look at your code with this possiblity in mind. Still can\'t figure out what\'s wrong? Use the View Solution feature above to see our suggested approach to this challenge.'
      }
      throw err
    })
  } catch (error) {
    result = error
  }

  return result
}

const defaultCode = `/* globals ipfs */

const run = async () => {
  // your code goes here!
  // be sure this function returns the requested value
}

return run
`
let oldIPFS

export default {
  components: {
    Header,
    Quiz,
    Resources,
    Breadcrumbs,
    Progress,
    Concepts,
    FileUpload,
    CodeEditor,
    Output,
    Info,
    Validator,
    CongratulationsCallout
  },
  data: self => {
    const tutorial = getCurrentTutorial(self.$route.matched[0])

    return {
      isResources: self.$attrs.isResources,
      resources: self.$attrs.resources,
      text: self.$attrs.text,
      exercise: self.$attrs.exercise,
      concepts: self.$attrs.concepts,
      cachedChoice: !!localStorage['cached' + self.$route.path],
      choice: localStorage[self.cacheKey] || '',
      cachedCode: !!localStorage['cached' + self.$route.path],
      code: localStorage[self.cacheKey] || self.$attrs.code || self.defaultCode,
      solution: self.$attrs.solution,
      isSubmitting: false,
      viewSolution: false,
      overrideErrors: self.$attrs.overrideErrors,
      isFileLesson: self.isFileLesson,
      isMultipleChoiceLesson: self.isMultipleChoiceLesson,
      question: self.$attrs.question,
      choices: self.$attrs.choices,
      parsedText: marked(self.$attrs.text || ''),
      parsedExercise: marked(self.$attrs.exercise || ''),
      parsedConcepts: marked(self.$attrs.concepts || ''),
      cacheKey: 'cached' + self.$route.path,
      cachedStateMsg: '',
      tutorial,
      tutorialPath: self.$route.path.split('/')[1],
      tutorialShortname: deriveShortname(self.$route.path),
      isTutorialPassed: isTutorialPassed(tutorial),
      lessonKey: 'passed' + self.$route.path,
      lessonPassed: !!localStorage['passed' + self.$route.path],
      createTestFile: self.$attrs.createTestFile,
      createTestTree: self.$attrs.createTestTree,
      output: self.output,
      showUploadInfo: false,
      expandExercise: false,
      uploadedFiles: window.uploadedFiles || false,
      editorReady: false
    }
  },
  computed: {
    lessonTitle: function () {
      const path = this.$route.path
      const split = this.$route.path.split('/')[1]
      for (const t in tutorialsList) {
        if (tutorialsList[t].url === split) {
          return tutorialsList[t].lessons.find((e, idx) => (`/${tutorialsList[t].url}/${(idx + 1).toString().padStart(2, 0)}`) === path)
        }
      }
      return ''
    },
    lessonNumber: function () {
      return parseInt(this.$route.path.slice(this.$route.path.lastIndexOf('/') + 1), 10)
    },
    lessonIssueUrl: function () {
      return encodeURI(`https://github.com/ProtoSchool/protoschool.github.io/issues/new?assignees=&labels=lesson-feedback&template=lesson-feedback.md&title=Lesson+Feedback%3A+${this.tutorialShortname}+-+Lesson+${this.lessonNumber}+(${this.lessonTitle})`)
    },
    tutorialIssueUrl: function () {
      return encodeURI(`https://github.com/ProtoSchool/protoschool.github.io/issues/new?assignees=&labels=tutorial-feedback&template=tutorial-feedback.md&title=Tutorial+Feedback%3A+${this.tutorialShortname}`)
    },
    lessonsInTutorial: function () {
      const basePath = this.$route.path.slice(0, -2)
      let number = this.$route.path.slice(-2)
      while (this.$router.resolve(basePath + number).route.name !== '404') {
        number++
        number = number.toString().padStart(2, '0')
      }
      return parseInt(number) - 1
    },
    nextLessonIsResources: function () {
      const basePath = this.$route.path.slice(0, -2)
      const hasResources = this.$router.resolve(basePath + 'resources').route.name !== '404'
      return this.lessonNumber === this.lessonsInTutorial && hasResources
    }
  },
  beforeCreate: function () {
    this.output = {}
    this.defaultCode = defaultCode
    this.IPFSPromise = import('ipfs').then(m => m.default)
    // doesn't work to set lessonPassed in here because it can't recognize lessonKey yet
  },
  beforeMount: function () {
    this.choice = localStorage[this.cacheKey] || ''
  },
  // updated: function () {
  //   runs on page load AND every keystroke in editor AND submit
  // },
  // beforeUpdate: function () {
  //   runs on every keystroke in editor, NOT on page load, NOT on code submit
  // },
  methods: {
    validationIssueUrl: function (code, validationTimeout) {
      return newGithubIssueUrl({
        user: 'ProtoSchool',
        repo: 'protoschool.github.io',
        title: `Validation Error: ${this.tutorialShortname} - Lesson ${this.lessonNumber} (${this.lessonTitle})`,
        labels: ['lesson-feedback', 'validation-error'],
        body: `If you submitted code for a lesson and received feedback indicating a validation error, you may have uncovered a bug in our lesson validation code. We've prepopulated the error type and the last code you submitted below as diagnostic clues. Feel free to add additional feedback about the lesson below before clicking "Submit new issue."

        \n**Before your code submission errored out, had you found anything about this lesson confusing?**\n
        \n**Any other feedback you'd like to share about this lesson?**\n
        \n**Any other feedback you'd like to share about ProtoSchool?**\n
        \nThank you for submitting your feedback to help us diagnose the problem!
        -----------------------------------------------------------------------
        Please do not edit the diagnostic information below this line.
        \n**Error type:**\n
        ${validationTimeout ? 'Validation timeout' : 'Missing validation case'}\n
        \n**The code that caused the error:**
        \n\`\`\`javascript\n${code}\n\`\`\`
        `
      })
    },
    run: async function (auto = false) {
      const args = []
      this.isSubmitting = true
      if (oldIPFS) {
        oldIPFS.stop()
        oldIPFS = null
      }
      const output = this.output
      const ipfs = await this.createIPFS()

      await ipfs.ready
      if (this.createTestFile) {
        await this.createFile(ipfs)
      }
      if (this.createTestTree) {
        await this.createTree(ipfs)
      }

      const code = this.editor.getValue()
      let modules = {}

      if (this.isFileLesson && this.uploadedFiles === false && auto === true) {
        this.showUploadInfo = true
        this.isSubmitting = false
        return
      } else {
        this.showUploadInfo = false
      }

      if (this.$attrs.modules) modules = this.$attrs.modules
      if (this.isFileLesson) args.unshift(this.uploadedFiles)
      // Output external errors or not depending on flag
      const result = await _eval(code, ipfs, modules, args)
      if (!this.$attrs.overrideErrors && result instanceof Error) {
        Vue.set(output, 'test', result)
        this.lessonPassed = !!localStorage[this.lessonKey]
        this.isSubmitting = false
        this.clearPassed()
        if (auto !== true) {
          this.trackEvent(EVENTS.CODE_SUBMIT_WRONG)
        }
        return
      }
      // Hide the solution
      this.viewSolution = false

      let test

      // Run the `validate` function in the lesson
      try {
        test = await this.$attrs.validate(result, ipfs, args)
      } catch (err) {
        // Something in our validation threw an error, it's probably a bug
        test = {
          fail: `You may have uncovered a bug in our validation code. Please help us improve this lesson by [**opening an issue**](${this.validationIssueUrl(code, true)}) noting that you encountered a validation timeout error. Then you can click **Reset Code** above the code editor, review the instructions, and try again. Still having trouble? Click **View Solution** below the code editor to see the approach we recommend for this challenge.`
        }
      }

      if (result instanceof Error) {
        if (test == null || !test.overrideError) {
          // In case of an error, if the author did not return anything or isn't sending an overriding error message, use the base error
          test = {
            fail: result.toString()
          }
        }
      } else if (test == null) {
        const validationErrorMessage = `You may have uncovered a bug in our validation code. Please help us improve this lesson by [**opening an issue**](${this.validationIssueUrl(code, false)}) noting that you encountered a validation case error. Then you can click **Reset Code**, review the instructions, and try again. Still having trouble? Click **View Solution** below the code editor to see the approach we recommend for this challenge.`
        // Our validation did not return anything and the original result is also not an error.
        // This may be the result of a missing validation case + not returning anything by default
        test = {
          fail: validationErrorMessage
        }
      }

      Vue.set(output, 'test', test)
      if (CID.isCID(result)) {
        oldIPFS = ipfs
        Vue.set(output.test, 'cid', result)
      } else {
        ipfs.stop()
      }
      if (output.test.success) {
        localStorage[this.lessonKey] = 'passed'
        if (auto !== true) {
          // track lesson passed if it has an exercise (incl file ones)
          this.trackEvent(EVENTS.LESSON_PASSED)
          this.updateTutorialState()
        }
      } else {
        this.clearPassed()
        if (auto !== true) {
          this.trackEvent(EVENTS.CODE_SUBMIT_WRONG)
        }
      }
      this.lessonPassed = !!localStorage[this.lessonKey]
      this.isSubmitting = false
    },
    createIPFS: function () {
      if (this.$attrs.createIPFS) {
        return this.$attrs.createIPFS()
      } else {
        const ipfs = this.IPFSPromise.then(IPFS => {
          this.ipfsConstructor = IPFS
          return new IPFS({ repo: Math.random().toString() })
        })
        return ipfs
      }
    },
    createFile: function (ipfs) {
      /* eslint-disable no-new */
      return ipfs.add(this.ipfsConstructor.Buffer.from('You did it!'))
    },
    createTree: function (ipfs) {
      /* eslint-disable no-new */
      return ipfs.add([
        {
          content: this.ipfsConstructor.Buffer.from('¯\\_(ツ)_/¯'),
          path: 'shrug.txt'
        },
        {
          content: this.ipfsConstructor.Buffer.from(':)'),
          path: 'smile.txt'
        },
        {
          content: this.ipfsConstructor.Buffer.from('You did it!'),
          path: 'fun/success.txt'
        }
      ], { wrapWithDirectory: true })
    },
    resetCode: function () {
      // TRACK? User chose to reset code
      this.code = this.$attrs.code || defaultCode
      // this ^ triggers onCodeChange which will clear cache
      this.editor.setValue(this.code)
      this.clearPassed()
      delete this.output.test
      this.showUploadInfo = false
      this.trackEvent(EVENTS.CODE_RESET)
    },
    resetFileUpload: function () {
      this.uploadedFiles = false
      delete this.output.test
      this.clearPassed()
    },
    clearPassed: function () {
      delete localStorage[this.lessonKey]
      this.lessonPassed = !!localStorage[this.lessonKey]
      delete localStorage[`passed/${this.tutorialPath}`]
    },
    loadCodeFromCache: function () {
      this.code = localStorage[this.cacheKey]
      this.editor.setValue(this.code)
    },
    updateTutorialState: function () {
      for (let i = 1; i <= this.lessonsInTutorial; i++) {
        const lessonNr = i.toString().padStart(2, 0)
        const lsKey = `passed/${this.tutorialPath}/${lessonNr}`
        if (localStorage[lsKey] !== 'passed') {
          return false
        }
      }
      localStorage[`passed/${this.tutorialPath}`] = 'passed'
      this.trackEvent(EVENTS.TUTORIAL_PASSED)
      return true
    },
    trackEvent: function (event, opts = {}) {
      window.Countly.q.push(['add_event', {
        key: event,
        segmentation: {
          tutorial: this.tutorialShortname,
          lessonNumber: this.lessonNumber,
          path: this.$route.path,
          ...opts
        }
      }])
    },
    onMounted: function (editor) {
      // runs on page load, NOT on every keystroke in editor
      this.editor = editor
      this.editorReady = true
      if (this.cachedCode) {
        // TRACK? returned to lesson previously visited
        this.loadCodeFromCache()
        this.cachedStateMsg = "Pick up where you left off. We've saved your code for you!"
        if (this.lessonPassed) {
          this.run(true)
        }
      } else {
        // TRACK? first time starting lesson
      }
    },
    onCodeChange: function () {
      if (this.editor.getValue() === (this.$attrs.code || defaultCode)) {
        // TRACK? edited back to default state by chance or by 'reset code'
        delete localStorage[this.cacheKey]
        this.cachedCode = !!localStorage[this.cacheKey]
      } else if (this.code === this.editor.getValue()) {
        // TRACK? returned to cached lesson in progress
      } else {
        localStorage[this.cacheKey] = this.editor.getValue()
        this.code = this.editor.getValue()
        this.cachedCode = !!localStorage[this.cacheKey]
        this.cachedStateMsg = "We're saving your code as you go."
        if (this.code !== this.solution) {
          this.clearPassed()
          delete this.output.test
        }
      }
    },
    handleRadioChoice (result) {
      localStorage[this.cacheKey] = result.selected
      this.choice = localStorage[this.cacheKey]
      this.cachedChoice = !!localStorage[this.cacheKey]
      Vue.set(this.output, 'test', result)
      if (this.output.test.success) {
        localStorage[this.lessonKey] = 'passed'
        this.lessonPassed = !!localStorage[this.lessonKey]
        if (result.auto !== true) {
          // track multiple choice lesson passed if not on page load
          this.trackEvent(EVENTS.LESSON_PASSED)
          this.updateTutorialState()
        }
      } else {
        this.clearPassed()
        if (result.auto !== true) {
          this.trackEvent(EVENTS.CHOICE_SUBMIT_WRONG, { wrongChoice: result.selected })
        }
      }
    },
    next: function () {
      if (this.exercise) {
        Vue.set(this.output, 'test', null)
      } else {
        localStorage[this.lessonKey] = 'passed'
        this.lessonPassed = !!localStorage[this.lessonKey]
        // track passed lesson if text only
        if (!this.isMultipleChoiceLesson) {
          this.trackEvent(EVENTS.LESSON_PASSED)
          this.updateTutorialState()
        }
      }
      const current = this.lessonNumber

      const next = this.nextLessonIsResources
        ? 'resources'
        : (parseInt(current) + 1).toString().padStart(2, '0')

      this.$router.push({ path: next })
    },
    tutorialMenu: function () {
      if (this.exercise) {
        Vue.set(this.output, 'test', null)
      } else {
        localStorage[this.lessonKey] = 'passed'
        this.lessonPassed = !!localStorage[this.lessonKey]
      }
      this.$router.push({ path: '/tutorials/' })
    },
    toggleExpandExercise: function () {
      this.expandExercise = !this.expandExercise
    },
    cyReplaceWithSolution: function () {
      this.editor.setValue(this.$attrs.solution)
    },
    parseData: (data) => marked(data)
  }
}
</script>

<style scoped>
.container {
  flex-grow: 1;
}

.exercise {
  overflow: hidden;
  background: #F6F7F9;
  max-width: 48rem;
}

.exercise.expand {
  height: 100vh;
  width: 100%;
  max-width: 100%;
  margin: 0;
  position: fixed;
  top: 0;
  right: 0;
  overflow: scroll;
}

.indent-1 {
  margin-left: 1rem;
}

span.textLink {
  color: blue;
  cursor: pointer;
}

footer a {
  color: aqua;
}

@media screen and (min-width: 60rem) {
  .indent-1 {
    margin-left: 93px;
  }
}
</style>
