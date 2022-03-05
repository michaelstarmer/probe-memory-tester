import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job'

export default class JobsController
{
    public async next_job({ response }: HttpContextContract)
    {
        try {
            let runningJob = await Job.query().withScopes(scopes => scopes.onlyRunning()).first();
            if (runningJob)
            {
                await runningJob.merge({ status: 'completed' }).save()
                console.log("Set running job to done!")
            }

            let query = await Job.query().preload('xmlConfig').withScopes(scopes => scopes.onlyWaiting()).first()
            console.log(query)
            let payload = {
                id: query?.id,
                memory: query?.memory,
                xmlFile: query?.xmlConfig.filename,
                created_at: query?.createdAt,
            }

            if (query)
                return response.json(payload)
            return response.json({ success: false })
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
        if (!job)
        {
            return response.json({  })
        }
        return response.json(job)
        
    }

    
}
