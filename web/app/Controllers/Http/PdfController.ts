import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PdfController {
    async view_create_report({ params, view, response }) {
        return view.render('generate-report')
    }
}
