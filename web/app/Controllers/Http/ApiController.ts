import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job'
import moment from 'moment'
import XmlFile from 'App/Models/XmlFile'
import JobLog from 'App/Models/JobLog'
import axios from 'axios'
import Application from '@ioc:Adonis/Core/Application'
import JobSecurityAudit from 'App/Models/JobSecurityAudit'

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
        const job = await Job
            .query()
            .where('id', id)
            .preload('systemStats')
            .preload('logs')
            .first();

        if (job) {
            console.log('job length:', job.systemStats.length)
        }

        console.log(job?.systemStats.length)
        const maxSystemStats = 40;
        let systemStats: object[] = []
        let jobJson = job?.toJSON()
        if (!job || !jobJson) {
            return response.json({ success: false, error: 'Job not found' })
        }

        if (jobJson.systemStats.length > maxSystemStats) {
            const step = Math.round(job.systemStats.length / maxSystemStats);
            for (let i = 0; i < jobJson.systemStats.length; i++) {
                let stat = jobJson.systemStats[i]
                if (i % step == 0) {
                    if (i < jobJson.systemStats.length - 10)
                        systemStats.push(stat)
                }
            }
            // 50 systemStat items, plus 10 latest items
            jobJson.systemStats = systemStats.concat(jobJson.systemStats.slice(-10))
        }

        console.log('System stat trimmed count:', jobJson.systemStats.length)

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

    public async get_next_job({ response }: HttpContextContract) {
        try {
            const runningJob = await Job
                .query()
                .whereIn('status', ['initializing', 'running'])
                .first()

            if (runningJob) {
                console.log('No waiting jobs')
                return response.json({})
            }

            const nextJob = await Job
                .query()
                .withScopes(scopes => scopes.onlyWaiting())
                .preload('xmlConfig')
                .first()

            if (!nextJob) {
                return response.json({});
            }
            return response.json(nextJob)
        } catch (error) {
            console.error('Error getting next job!', error)
            return response.status(400).json({ error })
        }
    }

    public async start_job_by_id({ params, response }: HttpContextContract) {
        const runningJob = await Job.query().withScopes(scopes => scopes.onlyRunning()).first()
        if (runningJob) {
            return response.json({ error: "Cannot start job when another is still running." })
        }

        const job = await Job.findByOrFail('id', params.id);
        try {
            if (job) {
                await job.merge({ status: 'running' }).save()
            }
            console.log('Starting job with ID:', job.id)
            return response.status(200).json(job)
        } catch (error) {
            console.log('Error starting new job.')
            return response.status(400).json({ error });
        }
    }

    public async create_job({ request, response }: HttpContextContract) {
        const payload = request.only(['memory', 'xmlFileId', 'duration', 'jenkinsJob', 'buildNumber', 'cpu']);

        try {
            if (!payload.memory || !payload.xmlFileId || !payload.jenkinsJob)
                return response.json({ error: 'Missing parameters. Required: memory, xmlFileId, duration, jenkinsJob' })

            if (!payload.duration)
                return response.json({ error: 'Missing parameter: duration' })

            // set default value
            if (!payload.cpu) {
                payload.cpu = 8
            }

            if (!payload.buildNumber) {
                const jenkinsJobUrl = `http://10.0.31.142/job/${payload.jenkinsJob}/api/json?pretty=true`
                const { data } = await axios.get(jenkinsJobUrl);

                if (data) {
                    payload.buildNumber = data['builds'][0]['number']
                }
            }


            const newJob = new Job()
            newJob.merge({
                memory: payload.memory,
                cpu: payload.cpu,
                xmlFileId: payload.xmlFileId,
                jenkinsJob: payload.jenkinsJob,
                buildNumber: payload.buildNumber,
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

    public async get_running_job({ response }) {
        const job = await Job
            .query()
            .withScopes(scopes => scopes.onlyRunning())
            .first();
        await job?.load('xmlConfig')
        await job?.load('securityAudit')
        await job?.load('systemStats')




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

    public async upload_file({ request, response }: HttpContextContract) {
        const file = request.file('frmFile')

        const xmlFile = new XmlFile()
        xmlFile.originalFilename = file?.fileName;
        xmlFile.filename = `config-${moment().unix()}.xml`
        xmlFile.filepath = Application.tmpPath('uploads')
        xmlFile.description = 'Testtest'

        try {
            await file?.move(xmlFile.filepath, {
                name: xmlFile.filename
            })


            const savedFile = await xmlFile.save()
            return response.json({
                success: true,
                file: savedFile
            })
        } catch (error) {
            console.error(error)
            return response.send(error)
        }
    }

    public async upload_view({ view }) {
        return view.render('upload')
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
            return response.status(200).json(jobLog);
        } catch (error) {
            console.error('error!', error)
            return response.json({ error })
        }
    }

    public async get_job_log({ params, response }: HttpContextContract) {
        const { id } = params;
        const job = await Job.find(id)
        await job?.load('logs')

        if (!job) {
            return response.status(400).json({ error: `Job not found with ID: ${id}` });
        }


        return response.json(job.logs)
    }

    public async set_job_status({ request, response, params }: HttpContextContract) {
        const { id, status } = params;
        const job = await Job.findBy('id', id)

        const validStatuses = ['waiting', 'initializing', 'completed', 'running', 'failed'];
        if (!validStatuses.includes(status)) {
            return response.status(400).json({ error: 'Status not valid', validStatuses })
        }

        if (!job) {
            return response.status(400).json({ error: 'Job not found.' })
        }

        await job.merge({ status }).save()
        return response.status(200).json({ success: true })

    }

    public async find_identical_jobs({ request, response, params }: HttpContextContract) {
        const { jenkinsJob, buildNumber } = params;

        if (!jenkinsJob || !buildNumber) {
            return response.status(400).json({ error: 'Missing arguments: job/buildNumber' })
        }

        const identicalJob = await Job
            .query()
            .where('build_number', `${buildNumber}`)
            .andWhere('jenkins_job', jenkinsJob)
            .andWhereNot('is_manual', 1)
            .first()

        if (identicalJob) {
            return response.json(identicalJob);
        }

        return response.json({});
    }

    public async stop_job({ response, params }: HttpContextContract) {
        const { id } = params;
        const job = await Job.findBy('id', id)

        const status = 'completed'

        if (!job) {
            return response.status(400).json({ error: 'Job not found.' })
        }

        const log = new JobLog()
        log.type = 'warn'
        log.message = 'Testing-job stopped manually'

        try {
            await job.merge({ status }).save()
            await job.related('logs').save(log)
            return response.status(200).json({ success: true })
        } catch (error) {
            console.error(error)
            return response.status(400).json({ error });
        }
    }

    public async update_security_audit({ params, request, response }: HttpContextContract) {
        const { jobId } = params;
        const payload = request.only(['gvmReportId', 'progress', 'inUse', 'status', 'pdf', 'vulns'])
        const audit = await JobSecurityAudit.findBy('job_id', jobId)
        await audit?.merge(payload).save()
        console.log(audit)
        return response.json(audit)
    }

    public async set_security_audit_status({ params, request, response }: HttpContextContract) {
        const { jobId, status } = params;
        const audit = await JobSecurityAudit.findBy('job_id', jobId)

        const validStatuses = ['waiting', 'initializing', 'completed', 'running', 'failed'];
        if (!validStatuses.includes(status)) {
            return response.status(400).json({ error: 'Status not valid', validStatuses })
        }

        if (!audit) {
            return response.status(400).json({ error: 'Security audit not found.' })
        }

        await audit.merge({ status }).save()
        return response.status(200).json({ success: true })
    }
}