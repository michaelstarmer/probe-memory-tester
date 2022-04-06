import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job'
import XmlFile from 'App/Models/XmlFile';
import Snapshot from 'App/Models/Snapshot';
const moment = require('moment')

export default class JobsController {

    public async get_all_jobs({ response }: HttpContextContract) {
        const jobs = await Job.query()
            .preload('xmlConfig')
            .preload('systemStats', statsQuery => {
                statsQuery.groupLimit(50)
                statsQuery.orderBy('created_at', 'asc')
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


            let waitingJob = await Job.query()
                .whereRaw(`start_at < '${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}'`)
                .preload('xmlConfig').withScopes(scopes => scopes.onlyWaiting()).first()
            if (!waitingJob) {
                return response.json({ error: 'No jobs found.' })
            }

            if (runningJob) {

                if (!runningJob.remaining) {
                    await runningJob.merge({ status: 'completed' }).save()
                    return response.json(runningJob)
                }
                if (waitingJob) {
                    await runningJob.merge({ status: 'completed' }).save()
                    return response.json(runningJob)

                }
            }

            await waitingJob?.merge({ status: 'running' }).save()


            return response.json(waitingJob)

        } catch (error) {
            console.error(error)
            return response.json({ success: false, error })
        }
    }

    public async create_job({ request, response }: HttpContextContract) {
        const payload = request.only(['memory', 'xmlFileId', 'duration', 'version', 'startAt', 'cpu']);

        try {
            if (!payload.memory || !payload.xmlFileId || !payload.version)
                return response.json({ error: 'Missing parameters. Required: memory, xmlFileId, duration, version, startAt' })

            if (!payload.duration)
                return response.json({ error: 'Missing parameter: duration' })

            const snapshot = await Snapshot.query().where('name', payload.version).first();
            if (!snapshot) {
                const snapshots = await Snapshot.all()
                return response.json({ error: 'Version does not exist as snapshot.', snapshots })
            } else {
                console.log('found snapshot:', snapshot)
            }

            if (!payload.cpu) {
                payload.cpu = 8
            }

            const newJob = new Job()
            newJob.merge({
                memory: payload.memory,
                cpu: payload.cpu,
                xmlFileId: payload.xmlFileId,
                version: snapshot.snapshotId,
                startAt: payload.startAt,
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

    public async last_job({ response }) {
        const lastJob = await Job.query().whereNot('status', 'waiting').first()
        if (!lastJob) {
            return response.json({})
        }
        try {
            return response.json(lastJob)
        } catch (error) {
            console.error(error)
            return response.json(error);
        }
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
