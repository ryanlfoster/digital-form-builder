const fs = require('fs')
const input = './mmo.json'
const output = '/Users/eadev/Documents/dev/mmo/mmo.out.json'

const o = require(input)

const map = Object.keys(o.pages).map(path => {
  const page = o.pages[path]

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

// console.log(JSON.stringify(map, null, 2))

function getPaths (page, parentPath = '') {
  const path = parentPath ? parentPath + '>>' + page.path : page.path
  if (page.next && page.next[1]) {
    return page.next.filter(next => next[1]).map(next => getPaths(next[2], path + '[' + next[0] + ']'))
  } else {
    return path
  }
}

// function getPaths (page, parentPath = '') {
//   const path = parentPath + '>' + page.path
//   if (page.next && page.next[1]) {
//     return page.next.filter(next => next[1]).map(next => getPaths(next[2], path + '[' + next[0] + ']'))
//   } else {
//     return path
//   }
// }

const flatten = arr => arr.reduce(
  (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
)
const paths = getPaths(start)
const flattened = flatten(paths)
console.log(flattened.map(j => j.split('>>')), flattened.length)
