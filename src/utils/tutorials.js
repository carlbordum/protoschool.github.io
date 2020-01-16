import tutorials from '../static/tutorials.json'

for (const tutorialId in tutorials) {
  tutorials[tutorialId].formattedId = tutorialId
  tutorials[tutorialId].id = parseInt(tutorialId, 10)
  tutorials[tutorialId].shortTitle = tutorials[tutorialId].url
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getTutorialByShortname (tutorialShortname) {
  return Object.values(tutorials).find(({ url }) => url === tutorialShortname)
}

export function getCurrentTutorial (route) {
  if (route.props && route.props.default) {
    if (route.props.default.tutorialId) {
      return tutorials[route.props.default.tutorialId]
    } else if (route.props.default.tutorialShortname) {
      return getTutorialByShortname(route.props.default.tutorialShortname)
    }
  }
  return null
}

export function getTutorialFullUrl (tutorial) {
  return `${window.location.origin}/${tutorial.url}`
}

export function isTutorialPassed (tutorial) {
  return !!localStorage[`passed/${tutorial.url}`]
}

/*
    Get all redirects for each tutorial through the `redirects` attribute
 */
export function getRedirects () {
  return Object.values(tutorials).reduce((redirects, tutorial) => {
    if (tutorial.redirects) {
      redirects = redirects.concat(
        ...tutorial.redirects.map(redirect => [
          {
            path: `/${redirect}`,
            redirect: `/${tutorial.url}`
          }, {
            path: `/${redirect}/resources`,
            redirect: `/${tutorial.url}/resources`
          }, {
            path: `/${redirect}/:lessonId`,
            redirect: `/${tutorial.url}/:lessonId`
          }
        ])
      )
    }

    return redirects
  }, [])
}
