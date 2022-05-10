import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job'
import moment from 'moment'
import XmlFile from 'App/Models/XmlFile'
import JobLog from 'App/Models/JobLog'

export default class ApiController {
    public async all_jobs({ response }: HttpContextContract) {
        const jobs = await Job.query()
            .preload('xmlConfig')
            .preload('systemStats', statsQuery => {
                statsQuery.groupLimit(50)
                statsQuery.orderBy('created_at', 'desc')
            })
        try {
            return response.json(jobs);
        } catch (error) {
            console.error('error fetching jobs:', error)
            return response.json({ error })
        }
    }

    public async get_job_by_id({ response, params }: HttpContextContract) {
        const { id } = params;
        const job = await Job.query().where('id', id).preload('systemStats').first();
        try {
            return response.json(job);
        } catch (error) {
            console.error('Error fetching job!', error);
            return response.json({ error });
        }
    }

    public async next_job({ response }: HttpContextContract) {
        try {
            let runningJob = await Job.query().withScopes(scopes => scopes.onlyRunning()).first();
            let waitingJob = await Job
                .query()
                .whereRaw(`start_at < '${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}'`)
                .preload('xmlConfig')
                .withScopes(scopes => scopes.onlyWaiting())
                .first()

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

            // set default value
            if (!payload.cpu) {
                payload.cpu = 8
            }


            const newJob = new Job()
            newJob.merge({
                memory: payload.memory,
                cpu: payload.cpu,
                xmlFileId: payload.xmlFileId,
                // version: 'CentOS7-based_6.1',
                // startAt: payload.startAt,
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

    public async running_job({ response }) {
        const job = await Job
            .query()
            .withScopes(scopes => scopes.onlyRunning())
            .first();
        await job?.load('xmlConfig')

        if (!job) {
            return response.json({})
        }
        return response.json(job)
    }

    public async last_job({ response }) {
        const lastJob = await Job.query().whereNot('status', 'waiting').orderBy('id', 'desc').first()
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

    public async upload_file({ request }: HttpContextContract) {
        console.log('upload file...')
        const xmlFile = request.file('xmlFile')
        console.log(xmlFile)
    }

    public async create_job_log({ request, response, params }) {
        const { id } = params;
        const { type, message } = request.only(['type', 'message']);
        const job = await Job.findBy('id', id);
        if (!job) {
            return response.json({ error: 'Job not found.' })
        }
        try {
            const jobLog = new JobLog()
            jobLog.type = type;
            jobLog.message = message;

            await job.related('logs').save(jobLog)
            return response.status(200);
        } catch (error) {
            console.error('error!', error)
            return response.json({ error })
        }
    }
}