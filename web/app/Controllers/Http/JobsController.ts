import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job';
import Settings from 'App/Models/Setting';
import axios from 'axios';

export default class JobsController {

    public async view_all_jobs({ view, response })
    {
        const jobs = await Job.query()
            .preload('xmlConfig')
            .preload('systemStats', statsQuery => {
                statsQuery.groupLimit(10)
            })
            .orderBy('created_at', 'desc')
            .limit(5)

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

        try {

            const { data } = await axios.get(jobsUrl);

            data.jobs.map(it => {
                if (it.name.search(/CentOS\d\-based/i) === 0) {
                    jobs.push(it.name)
                }
            })
            console.log(jobs)
            return view.render('new-job', { jobs })
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

    public async save_custom_job({ request, response }: HttpContextContract) {
        const { jenkinsJob, duration, xmlFileId, memory } = request.all();

        let buildNumber = null;
        const jenkinsJobUrl = `http://10.0.31.142/job/${jenkinsJob}/api/json?pretty=true`
        const { data } = await axios.get(jenkinsJobUrl);

        if (data) {
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
            response.redirect().toRoute('home')
        } catch (error) {
            console.error('error creating manual job!', error);
            return response.send(error)
        }
    }

    public async view_job({ view, response, params }: HttpContextContract) {
        const job = await Job.query().where('id', params.id).preload('systemStats').preload('logs').first()
        const probeIp = await Settings.findBy('key', 'probe_ip')

        if (!job) {
            return response.send(`Job with ID ${params.id} not found.`);
        }

        console.log('Job found:', job)
        return view.render('job', { job, probeIp });
    }

}
