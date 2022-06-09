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
        const { frmIngress, frmRows, frmRemarks } = request.all()
        console.log({ frmIngress, frmRows, frmRemarks })

        console.log('POST generate report')
        const report = new BtechReport()
        const json = await report.generate({ frmIngress, })
        return response.json(json)
    }
}
