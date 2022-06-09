import Application from '@ioc:Adonis/Core/Application'
import View from '@ioc:Adonis/Core/View'
const puppeteer = require('puppeteer')
const PDFMerger = require('pdf-merger-js')

export default class BtechReport {
    constructor() {

    }

    async createCoverPage() {

    }

    async merge(sourcePdf, targetPdf) {
        const publicPath = Application.publicPath();
        let merger = new PDFMerger();
        merger.add(publicPath + sourcePdf)
        merger.add(publicPath + '/' + targetPdf)
        await merger.save(publicPath + sourcePdf)
        return sourcePdf;
    }

    async generate({ job, ingress, rows, remarks }) {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
        const page = await browser.newPage()

        const content = await View.render('report-templates/security-report', { job, ingress, rows, remarks })

        const filePath = `security-reports/report_job-${job.id}`
        try {
            await page.setContent(content)
            await page.screenshot({ path: `${Application.publicPath()}/${filePath}.png`, fullPage: true })
            await page.pdf({ path: `${Application.publicPath()}/${filePath}.pdf`, format: 'A4', printBackground: true })
            await browser.close()
            console.log('Done')
            return {
                success: true,
                pdf: `/${filePath}.pdf`,
                img: `/${filePath}.png`
            }
        } catch (error) {
            console.error('generate error!', error)
            return false;
        }
    }
}