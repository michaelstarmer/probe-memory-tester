import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job'
import ProbeConfig from 'App/Models/ProbeConfig'
const xml2js = require('xml2js')
const axios = require('axios');

export default class AppController {

    public async index({view, response}: HttpContextContract)
    {
        const parser = new xml2js.Parser()

        const jobs = await Job.query().withScopes(scopes => scopes.ignoreCompleted())
        const probeIp = await ProbeConfig.findByOrFail('key', 'ip')
        console.log(probeIp.toJSON())
        console.log(jobs)

        
        try {
            const payload = await axios.get(`http://${probeIp.value}/probe/status`);
            if (!payload)
            {
                return response.json({ error: 'Probe not found' })
            }
            const json = await parser.parseStringPromise(payload.data);
            const probeData = {
                ip: probeIp.value,
                memory: Math.round(Number(json.Status.Resources[0].ram_free) / 1e+4),
                swVersion: json.Status.System[0].software_version
            }

            console.log(JSON.stringify(json.Status.Resources[0]))
            console.log(payload.data.url)
            console.log({probeData})
            
            return view.render('welcome', {jobs, probeData})
        } catch (error) {
            console.error('axios error!', error)
            return response.json({ error: 'Probe not found', details: error })

        }

    }
}   
