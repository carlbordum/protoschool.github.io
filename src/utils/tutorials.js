import tutorialsList from '../static/tutorials.json'

// if accessing from a tutorial itself (incl landing page, lessons, resources) via route
export const getCurrentTutorial = route => (
  route.props && route.props.default && route.props.default.tutorialId && tutorialsList[route.props.default.tutorialId]
)

// if accessing from within the lesson via route
export const getCurrentLesson = (route) => {
  let lesson
  if (route.path.includes('/resources')) {
    lesson = {
      title: 'Resources',
      types: []
    }
  } else {
    // get lesson object from tutorials.json
    lesson = getCurrentTutorial(route).lessons[route.props.default.lessonId - 1]
  }
  // add more useful properties to it // BUT MAKE SURE THEY WORK FOR RESOURCES PAGE
  // lesson.path = `/${getCurrentTutorial(route).url}/${route.props.default.lessonId}`
  return lesson
}

export const getTutorialFullUrl = tutorial => `${window.location.origin}/${tutorial.url}`

export const isTutorialPassed = tutorial => !!localStorage[`passed/${tutorial.url}`]

// can access from anywhere with tutorialId
export const getAllLessonsInTutorial = tutorialId => {
  return tutorialsList[tutorialId].lessons
}

// can access from anywhere with tutorialId
export const getTutorialType = tutorialId => {
  if (tutorialsList[tutorialId].lessons.some(lesson => lesson.types.includes('code'))) {
    return 'code'
  } else if (tutorialsList[tutorialId].lessons.some(lesson => lesson.types.includes('multiple-choice'))) {
    return 'multiple-choice'
  } else {
    return 'reading'
  }
}

// SAMPLE TUTORIAL DATA FORMAT FROM TUTORIALS.JSON
// "0002": {
//   "url": "basics",
//   "project": "IPFS",
//   "title": "P2P Data Links with Content Addressing",
//   "description": "Store, fetch, and create verifiable links between peer-hosted datasets using the IPFS DAG API and CIDs. It’s graphs with friends!",
//   "lessons": [
//     {
//       "title": "Create a node and return a Content Identifier (CID)",
//       "types": ["code"]
//     },
//     {
//       "title": "Create a new node that's linked to an old one",
//       "types": ["code"]
//     },
//     {
//       "title": "Read nested data using link",
//       "types": ["code"]
//     }
//   ],
//   "resources": [
//     {
//       "title": "JS-IPFS DAG API",
//       "link": "https://github.com/ipfs/interface-js-ipfs-core/blob/master/SPEC/DAG.md",
//       "type": "docs"
//     },
//     {
//       "title": "Blogging on the Decentralized Web",
//       "link": "https://proto.school/#/blog/",
//       "type": "tutorial",
//       "description": "Ready for a bigger challenge with the IPFS DAG API? Use CIDs to build and update a complex web of data."
//     }
//   ]
// },
