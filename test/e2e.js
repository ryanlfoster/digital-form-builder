const Lab = require('lab')
const url = require('url')
const driver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const firefox = require('selenium-webdriver/firefox')
const getJourneys = require('./get-journeys')

const { until } = driver
const lab = exports.lab = Lab.script()

const browserName = 'chrome'
const baseUrl = 'http://localhost:3009/activity-location'
const mmoData = require('../server/mmo.json')
const journeys = getJourneys(mmoData)

console.log(journeys.length)
// console.log(journeys)

lab.experiment('Metadata Driven e2e Tests', () => {
  let browser

  lab.before(async ({ context }) => {
    browser = await new driver.Builder()
      .forBrowser(browserName)
      .setChromeOptions(new chrome.Options().headless())
      .setFirefoxOptions(new firefox.Options().headless())
      .build()
  })

  lab.test('Base url', async ({ context }) => {
    await browser.get(baseUrl)
    await browser.wait(until.urlIs(baseUrl))
  })

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
