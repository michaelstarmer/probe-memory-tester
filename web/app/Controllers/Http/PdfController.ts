import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job'
import BtechReport from 'App/modules/BtechReport';

export default class PdfController {
    async view_generate_report({ params, view, response }: HttpContextContract) {
        const { id } = params;
        const job = await Job.find(id)
        return view.render('generate-report', { job })
    }

    async generate_report({ params, view, request, response }: HttpContextContract) {
        // 1. Ingress below title (default value, but customizable)

        // 2. Parse strings[] to table (only 1 table)

        // 3. Parse remarks[] to info-box below table
        const { id } = params;
        const job = await Job.find(id);
        await job?.load('securityAudit')
        const { frmIngress, frmRows, frmRemarks, attachScanReport } = request.all()


        try {
            console.log('POST generate report')
            const report = new BtechReport()
            const pdfCover = await report.generate({ job, ingress: frmIngress, rows: frmRows, remarks: frmRemarks })
            const pdfAttachment = '/app/build/public/public/' + job?.securityAudit.pdf;

            if (!pdfCover['pdf'] || !pdfAttachment) {
                return response.send("Error: missing pdf cover or attachment.")
            }

            let generatedReport = pdfCover['pdf'];
            if (attachScanReport) {
                generatedReport = await report.merge(pdfCover['pdf'], pdfAttachment);
            }

            console.log(generatedReport)
            return response.redirect(generatedReport)
        } catch (error) {
            console.error(error)
            return response.send("Something went wrong!", error);
        }
    }
}
