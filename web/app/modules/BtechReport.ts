const puppeteer = require('puppeteer')
import Application from '@ioc:Adonis/Core/Application'
import View from '@ioc:Adonis/Core/View'
export default class BtechReport {
    constructor() {

    }

    async generate() {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
        const page = await browser.newPage()

        const content = await View.render('report-templates/security-report')
        try {
            await page.setContent(content)
            await page.screenshot({ path: Application.publicPath() + '/test.png', fullPage: true })
            await page.pdf({ path: Application.publicPath() + '/test.pdf', format: 'A4', printBackground: true })
            await browser.close()
            console.log('Done')
            return {
                success: true,
                pdf: `${Application.publicPath()}/test.pdf`,
                img: `${Application.publicPath()}/test.png`
            }
        } catch (error) {
            console.error('generate error!', error)
            return false;
        }
    }
}