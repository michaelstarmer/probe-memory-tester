import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job'
import moment from 'moment'
import XmlFile from 'App/Models/XmlFile'
import JobLog from 'App/Models/JobLog'
import axios from 'axios'
import Application from '@ioc:Adonis/Core/Application'
import JobSecurityAudit from 'App/Models/JobSecurityAudit'
import Setting from 'App/Models/Setting'
import ProcStat from 'App/Models/ProcStat'
import Logger from '@ioc:Adonis/Core/Logger'
import ProcStatAlert from 'App/Models/ProcStatAlert'


export default class ApiController {
    async get_probe_config({ response }: HttpContextContract) {
        const payload = {}
        const setting = await Setting.all()
        setting.forEach(it => payload[it.key] = it.value)
        return response.json(payload)
    }

    async set_probe_config({ request, response }) {
        const { key, value } = request.all()
        const setting = await Setting.findBy('key', key);
        if (!setting) {
            return response.json({ success: false, error: 'Missing key/value for setting.' })
        }
        try {

            await setting.merge({ value });

        } catch (error) {
            return response.json({ success: false, error });
        }

        return response.json({ success: true, message: 'Config updated.' });
    }

    public async jobs({ response, request }: HttpContextContract) {
        const { limit, status } = request.qs();

        const jobs = await Job.query()
            .where('status', status)
            .preload('xmlConfig')
            .preload('systemStats', statsQuery => {
                statsQuery.groupLimit(50)
                statsQuery.orderBy('created_at', 'desc')
            })
            .orderBy('createdAt', 'desc')
            .limit(limit)
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
            .preload('procStatAlerts')
            .preload('securityAudit')
            .first();


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

        try {
            return response.json(jobJson);
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
        const payload = request.only(['memory', 'xmlFileId', 'duration', 'jenkinsJob', 'dashVersion', 'gitCommit', 'buildNumber', 'cpu', 'securityAudit']);

        try {
            if (!payload.xmlFileId || !payload.jenkinsJob)
                return response.json({ error: 'Missing parameters. Required: memory, xmlFileId, duration, jenkinsJob' })

            if (!payload.duration)
                return response.json({ error: 'Missing parameter: duration' })

            console.log('payload:', payload)

            // set default value
            if (!payload.cpu) {
                payload.cpu = 8
            }

            if (!payload.buildNumber) {
                const jenkinsJobUrl = `http://10.0.31.142/job/${payload.jenkinsJob}/lastSuccessfulBuild/api/json?pretty=true`
                const { data } = await axios.get(jenkinsJobUrl);

                if (data) {
                    payload.buildNumber = data['build']['number']
                }
            }


            const newJob = new Job()
            newJob.merge({
                memory: payload.memory || 0,
                cpu: payload.cpu,
                xmlFileId: payload.xmlFileId,
                jenkinsJob: payload.jenkinsJob,
                buildNumber: payload.buildNumber,
                gitCommit: payload.gitCommit,
                dashVersion: payload.dashVersion,
            })

            if (payload.duration) {

                newJob.duration = payload.duration;
            }
            await newJob.save()

            if (payload.securityAudit) {
                await newJob.related('securityAudit').create({ status: 'waiting' })
                console.log('Added security audit request to job.')
            }

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

    public async latest_alerts({ response }: HttpContextContract) {
        const alerts = await ProcStatAlert
            .query()
            .preload('job')
            .orderBy('created_at', 'desc')
            .limit(10)
        try {
            return response.json(alerts);
        } catch (error) {
            console.error('failed to fetch latest alerts!', error)
            return response.json(error)
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
        await job?.load('procStatAlerts')

        if (!job) {
            return response.status(400).json({ error: `Job not found with ID: ${id}` });
        }

        console.log('Logs for job', id)
        console.log('Log length:', job.logs.length)
        console.log('alert length:', job.procStatAlerts.length)
        return response.json([...job.logs, ...job.procStatAlerts])
    }

    public async get_job_alerts({ params, response }: HttpContextContract) {
        const { id } = params;
        const job = await Job.find(id);
        await job?.load('procStatAlerts');

        if (!job) {
            return response.status(400).json({ error: 'Could not get alerts because the job was not found.' })
        }

        try {
            return response.json(job.procStatAlerts);
        } catch (error) {
            console.error(error)
            return response.json({ success: false, error })
        }
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
        const payload = request.only(['gvmReportId', 'progress', 'inUse', 'status', 'pdf', 'vulnCountLow', 'vulnCountMedium', 'vulnCountHigh'])
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

    public async job_proc_stats({ params, response }: HttpContextContract) {
        const procStats = await ProcStat
            .query()
            .where('job_id', params.jobId)

        console.log('# of proc stats:', procStats.length)
        let stats: {} = {};
        procStats.map(it => {
            if (!stats[it.name]) {
                stats[it.name] = []
            }
            stats[it.name].push(it)
        })
        console.log(stats['ana'])
        return response.json(stats['ana'])
    }

    public async add_proc_stats({ params, request, response }: HttpContextContract) {
        let payload = request.body()
        const job = await Job.find(params.jobId);
        if (!job) {
            return response.status(400).json({ success: false, error: "Job not found." })
        }


        try {
            for (const ps of payload) {
                console.log(ps)

                if (!ps['name']) {
                    Logger.warn('Payload (procstat) missing param: <name>')
                    continue
                }
                try {
                    await ProcStat.create({
                        jobId: job.id,
                        name: ps['name'],
                        mem: ps['mem'],
                        cpu: ps['cpu'],
                    })
                    console.log('Saved procstat:', ps['name']);
                } catch (error) {
                    console.error('Failed to save procstat: ' + ps['name'] + ':', error);
                }
            }

            return response.json({ success: true })
        } catch (error) {
            console.error("Create ProcStat error!", error);
            return response.status(400).json({ error });
        }

    }

    public async get_proc_stats_by_job_id({ params, response }) {
        const { jobId } = params;
        const procStats = await ProcStat.findBy('job_id', jobId);
        if (!procStats) {
            console.error('no proc stats found.');
            return response.json()
        }
        return response.json(procStats);
    }
}