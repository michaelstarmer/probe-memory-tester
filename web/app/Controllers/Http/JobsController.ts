import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job'
import XmlFile from 'App/Models/XmlFile';
import { DateTime } from 'luxon';
const moment = require('moment')

export default class JobsController {

    public async get_all_jobs({ response }: HttpContextContract) {
        const jobs = await Job.query()
            .preload('xmlConfig')
            .preload('systemStats', statsQuery => {
                statsQuery.groupLimit(50)
                statsQuery.orderBy('created_at', 'asc')
            })
            .preload('btechProcs', procsQuery => {
                procsQuery.groupLimit(4)
            })

        try {
            return response.json(jobs);
        } catch (error) {
            return response.json({ error })
        }
    }

    public async next_job({ response }: HttpContextContract) {
        try {
            let runningJob = await Job.query().withScopes(scopes => scopes.onlyRunning()).first();


            let waitingJob = await Job.query().whereRaw(`start_at < '${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}'`).preload('xmlConfig').withScopes(scopes => scopes.onlyWaiting()).first()
            if (!waitingJob) {
                return response.json({ error: 'No jobs found.' })
            }

            if (runningJob) {
                console.log('\n\nRemaining:', runningJob.remaining)
                console.log("Set running job to done!")
                if (!runningJob.remaining) {
                    await runningJob.merge({ status: 'completed' }).save()
                }
                if (waitingJob) {
                    await runningJob.merge({ status: 'completed' }).save()
                }
            }

            await waitingJob?.merge({ status: 'running' })
            console.log('\nREMAINING:', waitingJob.remaining)
            // console.log(waitingJob)
            let payload = {
                id: waitingJob?.id,
                memory: waitingJob?.memory,
                xmlFile: waitingJob?.xmlConfig.filename,
                created_at: waitingJob?.createdAt,
                startAt: waitingJob?.startAt,
                remaining: waitingJob?.remaining,
            }

            return response.json(payload)

        } catch (error) {
            console.error(error)
            return response.json({ success: false, error })
        }
    }

    public async create_job({ request, response }: HttpContextContract) {
        const payload = request.only(['memory', 'xmlFileId', 'duration']);
        try {
            if (!payload.memory || !payload.xmlFileId)
                return response.json({ error: 'Missing parameters (memory or xmlFile)' })

            const newJob = new Job()
            newJob.merge({
                memory: payload.memory,
                xmlFileId: payload.xmlFileId
            })

            if (payload.duration) {

                newJob.duration = payload.duration;
            }
            await newJob.save()

            return response.json(newJob)
        } catch (error) {
            console.error('save job error!', error)
            return response.status(400).json({ error })
        }
    }

    public async active_job({ response }) {
        const job = await Job.query().withScopes(scopes => scopes.onlyRunning()).first();
        await job?.load('xmlConfig')
        if (!job) {
            return response.json({})
        }
        return response.json(job)

    }

    public async get_all_xml({ response }) {
        const xmlFiles = await XmlFile.all();
        try {

            return response.json(xmlFiles)

        } catch (error) {
            return response.status(400).json({ error })
        }
    }


}
