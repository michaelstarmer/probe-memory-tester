import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job';
import SystemStat from 'App/Models/SystemStat';

export default class SystemStatController
{
    public async stats_by_job_id({ params, request, response })
    {
        const { jobId } = params;
        console.log(request.params)
        if (!jobId)
        {
            return response.status(400).json({ error: 'Missing parameter: jobId' });
        }
        const stats = await SystemStat.query().where('job_id', jobId);
        console.log(`Found ${stats.length} jobs.`);
        return response.json(stats);
    }

    public async create({ request, response }: HttpContextContract)
    {
        const activeJob = await Job.query().withScopes(scopes => scopes.onlyRunning()).first();
        try {
            if (!activeJob)
            {
                return response.json({ error: 'No active jobs.' });
            }

            const { cpu, mem, alerts } = request.all()
            if (!cpu || !mem)
            {
                return response.json({ error: 'Missing required values (mem/cpu).' });
            }

            await activeJob.related('systemStats').create({ cpu, mem, alerts })
        } catch (error) {
            console.error('create SystemStat error!', error);
            return response.status(412).json({ error });
        }
    }

    public async create_by_job({ request, response, params }: HttpContextContract)
    {
        const { jobId } = params;
        const job = await Job.find(jobId);
        if (!job)
        {
            return response.json({ error: 'Job not found.' });
        }

        let { cpu, mem, alerts } = request.all();

        if (!cpu || !mem)
        {
            return response.json({ error: 'Missing fields.' });
        }

        try {
            const systemStat = new SystemStat()
            systemStat.fill({
                cpu,
                mem,
                alerts: alerts || null
            })
            await job.related('systemStats').save(systemStat);

            console.log("New system stat added to job", jobId);
            return response.json({})
        } catch (error) {
            console.error(error);
            return response.json({ error });
        }

        return response.json({ job })
    }
}