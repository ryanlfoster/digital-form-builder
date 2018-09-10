// Takes an mmoData object and works out all available paths through.
// It returns an array of items where each item is an array of journey paths and the choice.
// E.g.
// [ '/activity-location[onOrUnderSea]',
//   '/jurisdiction[elsewhere]',
//   '/elsewhere-in-the-world/activity-type[incineration]',
//   '/elsewhere-in-the-world/incineration[other]',
//   '/elsewhere-in-the-world/incineration/where-loaded[no]',
//   '/licence-not-required' ]
// The output is then used in the automated tests.
// It should report about the completeness of the data and highlight any inconsistencies.
module.exports = (mmoData) => {
  const map = Object.keys(mmoData.pages).map(path => {
    const page = mmoData.pages[path]

    if (Array.isArray(page.options)) {
      return {
        path,
        next: page.options.map((option, i) => {
          const isYesNo = typeof option === 'string'
          const targetPath = isYesNo ? option : option[2]

          return [isYesNo ? (i === 0 ? 'yes' : 'no') : option[0], targetPath]
        })
      }
    } else {
      return { path }
    }
  })

  map.map(page => {
    if (page.next) {
      page.next.forEach(next => {
        const target = map.find(p => p.path === next[1])
        next.push(target)
      })
    }

    return page
  })

  const start = map[0]

  function getPaths (page, parentPath = '') {
    const path = parentPath ? parentPath + '>>' + page.path : page.path
    if (page.next && page.next[1]) {
      return page.next.filter(next => next[1]).map(next => getPaths(next[2], path + '[' + next[0] + ']'))
    } else {
      return path
    }
  }

  const flatten = arr => arr.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
  )
  const paths = getPaths(start)
  const flattened = flatten(paths)

  return flattened.map(j => j.split('>>'))
}
