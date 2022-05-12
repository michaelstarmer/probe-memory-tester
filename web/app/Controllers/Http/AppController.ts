import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job'
import Setting from 'App/Models/Setting'
const xml2js = require('xml2js')
const axios = require('axios');

export default class AppController {

    public async index({ view }: HttpContextContract) {
        const parser = new xml2js.Parser()

        // Fetch all jobs and limit each of them to display the 10 latest system stats (cpu/mem)
        const jobs = await Job.query()
            .preload('xmlConfig')
            .preload('systemStats', statsQuery => {
                statsQuery.groupLimit(10)
            })

        const probeIp = await Setting.findByOrFail('key', 'probe_ip')
        const vmName = await Setting.findByOrFail('key', 'vm_name');
        const activeJobsCount = (await Job.query().whereNot("status", "completed")).length

        const probeData = {
            ip: probeIp.value,
            vmName: vmName.value,
            swVersion: null,
            isAvailable: true,
            isOffline: false,
        }

        /**
         * perform a simple check to see if probe is online and reachable
         */
        try {
            const payload = await axios.get(`http://${probeIp.value}/probe/status`, { timeout: 3000 });

            if (activeJobsCount > 0) {
                probeData.isAvailable = false;
            }
            if (!payload) {
                console.error('No response from probe.')
            }
            const json = await parser.parseStringPromise(payload.data);
            if (json && json.Status) {
                probeData.swVersion = json.Status.System[0].software_version;
            }
        } catch (error) {
            console.error('axios error!', error)
            probeData.isOffline = true;

        }

        return view.render('welcome', { jobs, probeData })

    }

    async get_probe_config({ response }: HttpContextContract) {
        const payload = {}
        const setting = await Setting.all()
        setting.forEach(it => payload[it.key] = it.value)
        return response.json(payload)
    }

    async edit_host({ view, request }: HttpContextContract) {
        const probeIp = await Setting.findBy('key', 'probe_ip')
        const jenkinsJob = await Setting.findBy('key', 'jenkins_job')
        const duration = await Setting.findBy('key', 'duration')
        const { error } = request.all();
        console.log(error)

        const jobsUrl = 'http://build.dev.btech/api/json?pretty=true'
        const jobs: string[] = []

        const { data } = await axios.get(jobsUrl);
        data.jobs.map(it => {
            if (it.name.search(/CentOS\d\-based/i) === 0) {
                jobs.push(it.name);
            }
        })

        return view.render('edit-host', {
            probeIp: probeIp?.value,
            jenkinsJob: jenkinsJob?.value,
            duration: duration?.value,
            jobs,
            error
        })
    }

    async update_host({ request, response }: HttpContextContract) {
        const { probeIp, jenkinsJob, duration } = request.only(['probeIp', 'jenkinsJob', 'duration'])

        if (!probeIp || !probeIp.length) {
            return response.redirect().withQs({ error: 'Probe ip required' }).toRoute('edit.host')
        }

        try {
            await Setting.query().where('key', 'probe_ip').update({ value: probeIp });
            await Setting.query().where('key', 'jenkins_job').update({ value: jenkinsJob });
            await Setting.query().where('key', 'duration').update({ value: duration });

            return response.redirect().toRoute('home')
        } catch (error) {
            console.error(error)
            return response.send(error)
        }


    }
}   
