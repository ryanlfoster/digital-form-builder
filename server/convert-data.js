let listId = 1

function createListFromOptions (path, value) {
  return {
    name: '_' + listId++,
    title: `List for page ${path}`,
    type: 'string',
    items: value.options.map(option => {
      return {
        text: option[1],
        value: option[0],
        description: option[3]
      }
    })
  }
}

module.exports = (mmoData) => {
  const converted = {
    sections: [],
    pages: [],
    lists: []
  }

  Object.keys(mmoData.sections).forEach(section => {
    converted.sections.push({ name: section, title: mmoData.sections[section] })
  })

  const pages = converted.pages

  Object.keys(mmoData.pages).forEach(key => {
    const value = mmoData.pages[key]
    const page = { path: key, section: value.section, components: [] }
    const components = Array.isArray(value.components) ? value.components : ['field']

    if (components[0] !== 'field') {
      page.title = value.title
    }

    function getFieldComponent (value) {
      const isYesNo = value.options.length === 2 &&
        typeof value.options[0] === 'string' &&
        typeof value.options[1] === 'string'

      if (isYesNo) {
        // YesNoField
        page.next = [{
          path: value.options[0]
        }, {
          path: value.options[1],
          if: `${value.name} == false`
        }]

        return {
          type: 'YesNoField',
          name: value.name,
          title: value.title,
          hint: value.hint
        }
      } else {
        // RadiosField
        const list = createListFromOptions(key, value)
        converted.lists.push(list)

        page.next = value.options.filter(option => option[2]).map(option => {
          return {
            path: option[2],
            if: `${value.name} == '${option[0]}'`
          }
        })

        return {
          type: 'RadiosField',
          name: value.name,
          title: value.title,
          hint: value.hint,
          options: {
            list: list.name
          }
        }
      }
    }

    components.forEach(component => {
      if (component === 'field') {
        page.components.push(getFieldComponent(value))
      } else {
        // HTML
        page.components.push({
          type: component.type || 'Html',
          content: component.html
        })
      }
    })

    pages.push(page)
  })
  // o.pages.forEach(page => {
  //   const p = pages[page.path] = {
  //     title: page.title,
  //     section: page.section
  //   }

  //   const components = page.components

  //   const component = components[0]
  //   const nexts = page.next
  //   if (component.type === 'RadiosField') {
  //     p.name = component.name
  //     p.title = component.title
  //     if (component.hint) {
  //       p.hint = component.hint
  //     }
  //     p.options = o.lists.find(list => list.name === component.options.list)
  //       .items.map(item => {
  //         const next = nexts.find(n => n.if && n.if.includes(item.value))
  //         const defaultNext = page.next.find(n => !n.if)
  //         return [item.value, item.text,
  //           next ? next.path : (defaultNext && defaultNext.path)]
  //       })
  //   } else if (component.type === 'YesNoField') {
  //     p.name = component.name
  //     p.title = component.title
  //     if (component.hint) {
  //       p.hint = component.hint
  //     }

  //     const yesNext = nexts.find(n => n.if && n.if.endsWith('== true'))
  //     const noNext = nexts.find(n => n.if && n.if.endsWith('== false'))
  //     const defaultNext = nexts.find(n => !n.if)
  //     p.options = [yesNext ? yesNext.path : defaultNext && defaultNext.path,
  //       noNext ? noNext.path : defaultNext && defaultNext.path]
  //   } else if (component.type === 'Para') {
  //     p.components = [{ Html: component.content }]
  //   }
  // })

  // fs.writeFileSync(output, JSON.stringify(o2, null, 2))

  console.log(converted)

  return converted
}
