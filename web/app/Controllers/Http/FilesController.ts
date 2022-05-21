import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import XmlFile from 'App/Models/XmlFile'
import moment from 'moment'

export default class FilesController {
    public async upload_file({ request, response, session }: HttpContextContract) {
        const file = request.file('frmFile')
        const description = request.input('frmDescription')

        const xmlFile = new XmlFile()
        xmlFile.originalFilename = file?.clientName;
        xmlFile.filename = `config-${moment().unix()}.xml`
        xmlFile.filepath = 'public/uploads/xml'
        xmlFile.description = description

        try {
            await file?.move(Application.publicPath('/uploads/xml'), {
                name: xmlFile.filename
            })


            await xmlFile.save()
            session.flash('success', 'XML file uploaded')
        } catch (error) {
            console.error(error)
            session.flash('error', 'Upload failed: ' + error.code)
        }
        return response.redirect('/uploads')
    }

    public async session_flash({ response, session })
    {
        try {
            
            session.flash('success', 'Success message')
            return response.redirect('/uploads')
        } catch (error) {
            return response.send(error)
        }
        
    }

    public async upload_view({ view, response, session }) {
        const files = await XmlFile.query().orderBy('created_at', 'desc')
        
        const xmlUploadPath = '/uploads/xml'
        
        try {
            return view.render('upload', { files, xmlUploadPath })
        } catch (error) {
            console.error(error)
            return response.send(error)
        }
    }
}