const Lab = require('lab')
const url = require('url')
const driver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const firefox = require('selenium-webdriver/firefox')
const getJourneys = require('./get-journeys')

const { By, until, Key } = driver
const lab = exports.lab = Lab.script()

const browserName = 'chrome'
const baseUrl = 'http://localhost:3009/activity-location'
const mmoData = require('../server/mmo.json')
const journeys = getJourneys(mmoData)

// console.log(journeys)
lab.experiment('Metadata Driven e2e Tests', () => {
  let browser

  lab.before(async ({ context }) => {
    browser = await new driver.Builder()
      .forBrowser(browserName)
      .setChromeOptions(new chrome.Options())
      .setFirefoxOptions(new firefox.Options())
      .build()
  })

  lab.test('Base url', async ({ context }) => {
    await browser.get(baseUrl)
    await browser.wait(until.urlIs(baseUrl))
  })

  async function fillFormField (component) {
    if (component.children) {
      if (component.type === 'UkAddressField') {
        // Clicking the postcode search button without a
        // query causes the manual entry form to display
        const find = await browser.findElement(By.css('button.postcode-lookup'))
        await find.click()
      }

      await fillForm(component.children.formItems)
    } else {
      const fieldData = fake(component, model)
      // console.log(fieldData)
      if (component.type === 'DatePartsField') {
        let el = await browser.findElement({ id: `${component.name}__day` })
        await el.clear()
        await el.sendKeys(fieldData.day)
        el = await browser.findElement({ id: `${component.name}__month` })
        await el.clear()
        await el.sendKeys(fieldData.month)
        el = await browser.findElement({ id: `${component.name}__year` })
        await el.clear()
        await el.sendKeys(fieldData.year)
      } else if (component.type === 'DateTimePartsField') {
        let el = await browser.findElement({ id: `${component.name}__day` })
        await el.clear()
        await el.sendKeys(fieldData.day)
        el = await browser.findElement({ id: `${component.name}__month` })
        await el.clear()
        await el.sendKeys(fieldData.month)
        el = await browser.findElement({ id: `${component.name}__year` })
        await el.clear()
        await el.sendKeys(fieldData.year)
        el = await browser.findElement({ id: `${component.name}__hour` })
        await el.clear()
        await el.sendKeys(fieldData.hour)
        el = await browser.findElement({ id: `${component.name}__minute` })
        await el.clear()
        await el.sendKeys(fieldData.minute)
      } else {
        if (component.type === 'SelectField') {
          const el = await browser.findElement({ id: component.name })
          await el.findElement(By.css(`option[value='${fieldData}']`)).click()
        } else if (component.type === 'RadiosField' || component.type === 'YesNoField') {
          const el = await browser.findElement({ id: `${component.name}-${fieldData}` })
          await el.click()
        } else if (component.type === 'DateField') {
          const el = await browser.findElement({ id: component.name })
          const iso = fieldData.toISOString()
          await el.sendKeys(iso.substr(8, 2), iso.substr(5, 2), iso.substr(0, 4))
        } else if (component.type === 'TimeField') {
          const el = await browser.findElement({ id: component.name })
          await el.sendKeys('23:15')
        } else if (component.type === 'DateTimeField') {
          const iso = fieldData.toISOString()
          const el = await browser.findElement({ id: component.name })
          await el.sendKeys(iso.substr(8, 2), iso.substr(5, 2), iso.substr(0, 4),
            Key.ARROW_RIGHT, iso.substr(11, 2), iso.substr(14, 2))
        } else {
          const el = await browser.findElement({ id: component.name })
          await el.clear()
          await el.sendKeys(fieldData)
        }
      }
    }
  }

  async function fillForm (components) {
    for (let i = 0; i < components.length; i++) {
      await fillFormField(components[i])
    }
  }

  for (let i = 0; i < journeys.length; i++) {
    lab.test(`Journey ${i + 1}`, async () => {
      const journey = journeys[i]

      // console.log(journey)

      for (let j = 0; j < journey.length; j++) {
        const part = journey[j]
        // console.log(part)
        let path, pick
        const idx = part.lastIndexOf('[')

        if (idx > -1) {
          path = part.substring(0, idx)
          pick = part.substring(idx + 1, part.length - 1)

          if (pick === 'yes') {
            pick = true
          } else if (pick === 'no') {
            pick = false
          }
        } else {
          path = part
        }

        const uri = url.resolve(baseUrl, path)
        // console.log(uri, pick)

        if (j === 0) {
          await browser.get(uri)
        }

        await browser.wait(until.urlIs(uri))
        // console.log(uri)
        if (pick !== undefined) {
          const css = `input[type=radio][value=${pick}]`
          // console.log(css)
          const el = await browser.findElement({ css: css })
          await el.click()
          const btn = await browser.findElement({ css: 'button[type=submit]' })
          await btn.click()
        }
      }
    })
  }

  lab.after(async ({ context }) => {
    await browser.quit()
  })
})
