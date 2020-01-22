import VueRouter from 'vue-router'

// Utils
import { migrateCache } from './utils/paths'
import { getRedirects as getTutorialRedirects } from './utils/tutorials'
// Components
import Home from './pages/Home.vue'
import Landing from './pages/Landing.vue'
import Lesson from './pages/Lesson.vue'
import ResourcesLesson from './pages/ResourcesLesson.vue'
import Chapters from './pages/Chapters.vue'
import Host from './pages/Host.vue'
import Build from './pages/Build.vue'
import Contribute from './pages/Contribute.vue'
import Tutorials from './pages/Tutorials.vue'
import NotFound from './pages/NotFound.vue'

const routes = [
  // Pages
  {
    path: '/',
    component: Home,
    name: 'Home'
  },
  {
    path: '/chapters',
    component: Chapters,
    name: 'Chapters'
  },
  {
    path: '/host',
    component: Host,
    name: 'Host'
  },
  {
    path: '/build',
    component: Build,
    name: 'Build'
  },
  {
    path: '/contribute',
    component: Contribute,
    name: 'Contribute'
  },
  {
    path: '/tutorials',
    component: Tutorials,
    name: 'Tutorials'
  },
  {
    path: '/404',
    name: '404',
    component: NotFound
  },
  // Tutorials
  ...getTutorialRedirects(),
  {
    path: '/:tutorialShortname',
    component: Landing,
    props: true
  },
  {
    path: '/:tutorialShortname/resources',
    component: ResourcesLesson,
    props: true
  },
  {
    path: '/:tutorialShortname/:lessonId',
    component: Lesson,
    props: true
  },
  // 404
  {
    path: '*',
    redirect: '404'
  }
]

// Migrate cache using configured redirects
migrateCache()

const router = new VueRouter({
  routes,
  scrollBehavior (to, from) {
    return { x: 0, y: 0 }
  }
})

// track page view via Countly when route changes
router.afterEach((to) => {
  if (!window.Countly) return
  window.Countly.q.push(['track_pageview', '/#' + to.path])
})

export default router
