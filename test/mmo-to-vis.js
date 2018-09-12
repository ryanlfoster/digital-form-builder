function convert (mmoData) {
  const idMap = {}
  const pages = []
  const declarations = []
  const links = []

  Object.keys(mmoData.pages).forEach(key => {
    const id = numberToLetters(++num)
    idMap[key] = id
    pages.push({ key, item: mmoData.pages[key] })

    const declaration = `${id} [label="${key}"]`
    declarations.push(declaration)
  })

  Object.keys(mmoData.pages).forEach(key => {
    const page = mmoData.pages[key]
    const id = idMap[key]

    if (page.options) {
      page.options.forEach((option, i) => {
        if (typeof option === 'string') {
          links.push({ from: id, to: idMap[option], label: i === 0 ? 'yes' : 'no' })
        } else if (option[2]) {
          const existing = links.find(link => link.from === id && link.to === idMap[option[2]])

          if (existing) {
            existing.label += `\\n${option[0]}`
          } else {
            links.push({ from: id, to: idMap[option[2]], label: option[0] })
          }
        }
      })
    }
  })

  const linkstr = links.map(link => `${link.from} -> ${link.to} [label="${link.label}"]`).join('\n')

  const graphs = [undefined].concat(Object.keys(mmoData.sections)).map(key => {
    if (key) {
      const section = mmoData.sections[key]
      const declarations = pages.filter(page => page.item.section === key).map(page => {
        const id = idMap[page.key]
        return `${id} [label="${smartTrim(page.key)}",style=filled,color=blue,fillcolor=white]`
      })

      return `
        subgraph cluster_${key} {
          label="${section}";
          ${declarations.join('\n')}
          style=filled;
          color=lightgrey;
        }
      `
    } else {
      const declarations = pages.filter(page => !page.item.section).map(page => {
        const id = idMap[page.key]
        return `${id} [label="${smartTrim(page.key)}"]`
      })

      return declarations.join('\n')
    }
  })

  return `
    digraph G {
      graph [fontname = "helvetica"];
      node [fontname = "helvetica"];
      edge [fontname = "helvetica"];
      ${graphs.join('\n')}
      ${linkstr}
    }
  `
}

let num = 0
function numberToLetters (nNum) {
  var result
  if (nNum <= 26) {
    result = letter(nNum)
  } else {
    var modulo = nNum % 26
    var quotient = Math.floor(nNum / 26)
    if (modulo === 0) {
      result = letter(quotient - 1) + letter(26)
    } else {
      result = letter(quotient) + letter(modulo)
    }
  }

  return result
}

function letter (nNum) {
  var a = 'A'.charCodeAt(0)
  return String.fromCharCode(a + nNum - 1)
}

function smartTrim (str) {
  if (str.length > 30) {
    return str.substr(0, 10) + '...' + str.substr(str.length - 17, str.length)
  }

  return str
}

console.log(convert(require('../server/mmo.json')))

module.exports = convert
