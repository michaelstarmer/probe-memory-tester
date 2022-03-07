import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job'
const moment = require('moment')

export default class JobsController
{



    public async next_job({ response }: HttpContextContract)
    {
        try {
            let runningJob = await Job.query().withScopes(scopes => scopes.onlyRunning()).first();
            

            let waitingJob = await Job.query().whereRaw(`start_at < '${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}'`).preload('xmlConfig').withScopes(scopes => scopes.onlyWaiting()).first()
            if (!waitingJob)
            {
                return response.json({ error: 'No jobs found.' })
            }
            
            if (runningJob)
            {
                await runningJob.merge({ status: 'completed' }).save()
                console.log("Set running job to done!")
            }

            await waitingJob?.merge({ status: 'running' })
            console.log(waitingJob)
            let payload = {
                id: waitingJob?.id,
                memory: waitingJob?.memory,
                xmlFile: waitingJob?.xmlConfig.filename,
                created_at: waitingJob?.createdAt,
            }

            return response.json(payload)
            
        } catch (error) {
            console.error(error)
            return response.json({ success: false, error })
        }
    }

    public async create_job({ request, response }: HttpContextContract)
    {
        const payload = request.only(['memory', 'xmlFileId']);
        try {
            if (!payload.memory || !payload.xmlFileId)
                return response.json({ error: 'Missing parameters (memory or xmlFile)' })
            
            const created = await Job.create({ memory: payload.memory, xmlFileId: payload.xmlFileId })
            console.log("Success");
            return response.json(created)
        } catch (error) {
            
        }
    }

    public async active_job({ response })
    {
        const job = await Job.query().withScopes(scopes => scopes.onlyRunning()).first();
        await job?.load('xmlConfig')
        if (!job)
        {
            return response.json({})
        }
        return response.json(job)
        
    }

    
}
