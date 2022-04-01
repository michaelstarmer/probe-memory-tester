import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job';
import BtechProc from 'App/Models/BtechProc';

export default class SystemStatController
{
    public async create({ params, request, response })
    {
        const { jobId } = params;
        const job = await Job.find(jobId);
        if (!job)
        {
            return response.json({ error: 'Job not found.' });
        }

        let { name, result, count } = request.all();
        
        
        if (!name || !result)
        {
            return response.json({ error: 'Missing fields.' });
        }

        try {
            const btechProc = new BtechProc()
            btechProc.fill({
                name,
                result,
                count: count || null
            })
            await job.related('btechProcs').save(btechProc);

            console.log("New btech process added to job", jobId);
            return response.json({})
        } catch (error) {
            console.error(error);
            return response.json({ error });
        }

        return response.json({ job })
    
    }
}