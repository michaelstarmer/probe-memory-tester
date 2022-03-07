import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job'
import ProbeConfig from 'App/Models/ProbeConfig'
const xml2js = require('xml2js')
const axios = require('axios');

export default class AppController {

    public async index({view, response}: HttpContextContract)
    {
        const parser = new xml2js.Parser()

        const jobs = await Job.query()
            .preload('xmlConfig')
            .preload('systemStats', statsQuery => {
            statsQuery.groupLimit(10)
            })
            .preload('btechProcs', procsQuery => {
                procsQuery.groupLimit(4)
            })
        const probeIp = await ProbeConfig.findByOrFail('key', 'probe_ip')
        const vmName = await ProbeConfig.findByOrFail('key', 'vm_name');
        const activeJobsCount = (await Job.query().whereNot("status", "completed")).length
        let isAvailable = false;
        try {
            const activeJobsCount = (await Job.query().whereNot("status", "completed")).length
            
            console.log(activeJobsCount)
            
            if (activeJobsCount == 0)
            {
                isAvailable = true;
            }
            
        } catch (error) {
            console.error(error)
            return response.internalServerError(error)
        }
        
        
        
        try {
            const payload = await axios.get(`http://${probeIp.value}/probe/status`);
            

            if (activeJobsCount == 0) {
                isAvailable = true;
            }
            if (!payload)
            {
                return response.json({ error: 'Probe not found' })
            }
            const json = await parser.parseStringPromise(payload.data);
            const probeData = {
                ip: probeIp.value,
                vmName: vmName.value,
                memory: Math.round(Number(json.Status.Resources[0].ram_free) / 1e+6),
                swVersion: json.Status.System[0].software_version,
                isAvailable,
            }

            for (const job of jobs)
            {
                if (job.btechProcs)
                {
                    console.log('Btech procs on job:', job.btechProcs.length)
                    for (const proc of job.btechProcs)
                    {
                        console.log(`${proc.name}:`, proc)
                    }
                }
            }

            
            return view.render('welcome', {jobs, probeData})
        } catch (error) {
            console.error('axios error!', error)
            return response.json({ error: 'Probe not found', details: error })

        }

    }
}   
