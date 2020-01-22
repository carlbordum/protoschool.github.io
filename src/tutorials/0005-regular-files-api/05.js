import pTimeout from 'p-timeout'

const validate = async (result, ipfs) => {
  let uploadedFiles = window.uploadedFiles || false
  let fileObjectsArray = window.uploadedFiles.map((file) => {
    return {
      path: file.name,
      content: file
    }
  })
  const expectedResults = await ipfs.add(fileObjectsArray, { wrapWithDirectory: true })

  if (!result) {
    return {
      fail: 'Oops! You forgot to return a result :('
    }
  }

  if (result.error) {
    return { error: result.error }
  }

  if (!Array.isArray(result)) {
    return {
      fail: 'The returned value should be an arrray.'
    }
  }

  if (uploadedFiles.length === result.length) {
    return {
      fail: "We can't find a directory in your results. Did you remember to set the `wrapWithDirectory` option to true?"
    }
  }

  if (uploadedFiles.length !== result.length - 1) {
    return {
      fail: "The resulting array seems to be wrong. You should have one element per file, plus another for the top-level directory. Maybe you created an extra subdirectory with one of the files' path name?"
    }
  }

  const resultingFiles = await pTimeout(ipfs.ls(result[result.length - 1].hash), 2000).catch(() => 'error')
  if (resultingFiles === 'error') {
    return {
      fail: 'Could not get CID of top-level directory. Please make sure you are returning the result of the `add` method. The items of the array should be objects with a `hash` attribute whose value must be a valid CID.'
    }
  } else {
    if (resultingFiles.length === 1) {
      return {
        fail: 'The last entry in your results correspond to a directory. Did you forget to use `wrapWithDirectory`?'
      }
    }
    if (resultingFiles.length !== uploadedFiles.length) {
      return {
        fail: "The number of uploaded files doesn't match the number of files on your IPFS node. Did you add every file you uploaded to IPFS? Did you make sure each file had a unique name when defining its path? Did you create any more directories than you needed to?"
      }
    }
  }

  if (JSON.stringify(result) === JSON.stringify(expectedResults)) {
    return {
      success: 'Success!',
      logDesc: "Here are the results returned by the `add` method.  Note that you have one object for each file, plus one for each directory created by the `{ wrapWithDirectory: true }` option (in this case, just the top-level directory with path `''`)." +
                "\n\n Because you used the `{ wrapWithDirectory: true }` option, the `path` of each file is now the filename you provided, rather than matching the file's `hash`.  You'll be able to use these human-readable paths to in combination with the directory's CID to access the file's content in a future lesson." +
                "\n\n We only have access to the added files' and directories' CIDs when the `add` method returns them. When you use this method in the future, you may want to save them for later use.",
      log: result
    }
  } else {
    return { fail: `Something seems to be wrong. Please click "Reset Code" and try again, taking another look at the instructions and editing only the portion of code indicated. Feeling really stuck? You can click "View Solution" to see our suggested code.` }
  }
}

const code = `/* global ipfs */
const run = async (files) => {

  let fileObjectsArray = // build your array of {content, path} objects here

  return // add the files to IPFS here, returning the result

}
return run
`

const solution = `/* global ipfs */
const run = async (files) => {

  // Using Array.map():

  let fileObjectsArray = files.map((file) => {
    return {
      path: file.name,
      content: file
    }
  })

  // Alternatively, using Array.forEach():
  //
  // let fileObjectsArray = []
  //
  // files.forEach((file) => {
  //   let fileObject = {
  //     path: file.name,
  //     content: file
  //   }
  //
  //   fileObjectsArray.push(fileObject)
  // })

  const results = await ipfs.add(fileObjectsArray, { wrapWithDirectory: true })

  return results

}
return run
`

const modules = { cids: require('cids') }

const options = {
  type: 'file-upload',
  overrideErrors: true
}

export default {
  validate,
  code,
  solution,
  modules,
  options
}
