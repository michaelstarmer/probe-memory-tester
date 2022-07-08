import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job';
import JobLog from 'App/Models/JobLog';
import JobSecurityAudit from 'App/Models/JobSecurityAudit';
import Settings from 'App/Models/Setting';
import XmlFile from 'App/Models/XmlFile';
import axios from 'axios';

export default class JobsController {

    public async view_all_jobs({ view, response }) {
        const jobs = await Job.query()
            .preload('xmlConfig')
            .preload('systemStats', statsQuery => {
                statsQuery.groupLimit(10)
            })
            .orderBy('created_at', 'desc')

        try {
            return view.render('all-jobs', { jobs })
        } catch (error) {
            console.error(error)
            return response.send(error)
        }
    }

    public async new_job_view({ view, response }) {

        const jobsUrl = 'http://build.dev.btech/api/json?pretty=true'
        const jobs: object[] = []
        const xmlFiles = await XmlFile.query().orderBy('created_at', 'desc')

        try {

            const { data } = await axios.get(jobsUrl);

            data.jobs.map(it => {
                if (it.name.search(/CentOS\d\-based/i) === 0) {
                    jobs.push(it.name)
                }
            })
            // for (const f of xmlFiles)
            // {
            //     console.log('file:', f)
            // }
            return view.render('new-job', { jobs, xmlFiles })
        } catch (error) {
            console.error(error)
            response.send(error)
            if (error.code === 'ENOTFOUND') {
                console.error('Error connectiong to Jenkins.')
                let message =
                    `Error while connecting to Jenkins @ ${jobsUrl}.

Code: ${error.code}
Message: ${error.message}
`
                response.send(message)
            }
        }
    }

    public async save_custom_job({ request, response, session }: HttpContextContract) {
        let { jenkinsJob, duration, xmlFileId, memory, securityAudit, buildNumber } = request.all();

        const jenkinsJobUrl = `http://10.0.31.142/job/${jenkinsJob}/api/json?pretty=true`
        const { data } = await axios.get(jenkinsJobUrl);

        if (buildNumber) {
            const buildUrl = `http://10.0.31.142/job/${jenkinsJob}/${buildNumber}/api/json?pretty=true`
            console.log(`Verifying that build number ${buildNumber} exists @ ${buildUrl}`)
            try {
                const buildNumberResponse = await axios.get(buildUrl);
                console.log(buildNumberResponse.data)

            } catch (error) {
                console.error('Invalid build number!');
                session.flash('errors', {
                    title: 'Invalid build number!',
                    description: `See which build number exists for <a href="http://10.0.31.142/job/${jenkinsJob}/">${jenkinsJob}</a>`
                })
                return response.redirect('/jobs/new')
            }
        }
        // if no build number specified, default to latest build
        if (data && !buildNumber) {
            buildNumber = data['builds'][0]['number']
        }
        try {
            const job = await Job.create({
                memory,
                jenkinsJob,
                buildNumber,
                xmlFileId,
                duration,
                isManual: true,
            })
            console.log("Manual job created successfully:", job)
            if (securityAudit) {
                const jobSecurityAudit = new JobSecurityAudit()
                await job.related('securityAudit').create(jobSecurityAudit)
            }
            response.redirect().toRoute('view_job', { id: job.id })
        } catch (error) {
            console.error('error creating manual job!', error);
            return response.send(error)
        }
    }

    public async view_job({ view, response, params }: HttpContextContract) {
        const job = await Job
            .query()
            .where('id', params.id)
            .preload('systemStats')
            .preload('logs')
            .preload('securityAudit')
            .preload('xmlConfig')
            .first()
        const probeIp = await Settings.findBy('key', 'probe_ip')

        if (!job) {
            return response.send(`Job with ID ${params.id} not found.`);
        }

        const latestStat = job.systemStats.slice(-1)[0]
        console.log(job.systemStats.slice(-1))
        
        
        const procStats = {
            ewe: { cpu: latestStat.eweCpu, mem: latestStat.eweMem },
            etr: { cpu: latestStat.etrCpu, mem: latestStat.etrMem },
            ott: { cpu: latestStat.ottCpu, mem: latestStat.ottMem },
            vidana: { cpu: latestStat.vidanaCpu, mem: latestStat.vidanaMem },
        }
        for (let [k,v] of Object.entries(procStats))
        {
            console.log(k,v)
            v.cpu = Number(v.cpu.toPrecision(2))
            v.mem = Number(v.mem.toPrecision(2))
        }
        console.log(procStats)
        console.log(latestStat[0])


        return view.render('job', { job, probeIp, procStats });
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
            return response.redirect().back()
        } catch (error) {
            console.error(error)
            return response.send(error)
        }
    }

}
