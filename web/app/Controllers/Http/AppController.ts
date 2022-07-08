import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job'
import Setting from 'App/Models/Setting'
const xml2js = require('xml2js')
const axios = require('axios');

export default class AppController {

    public async index({ view, response }: HttpContextContract) {
        const parser = new xml2js.Parser()

        // Fetch all jobs and limit each of them to display the 10 latest system stats (cpu/mem)


        const jobs = await Job.query()
            .preload('xmlConfig')
            .preload('systemStats', statsQuery => {
                statsQuery.groupLimit(10)
            })
            .orderBy('created_at', 'desc')
            .limit(5)

        const probeIp = await Setting.findByOrFail('key', 'probe_ip')
        const vmName = await Setting.findByOrFail('key', 'vm_name');
        const activeJobsCount = (await Job.query().whereNot("status", "completed")).length
        const jenkinsJob = await Setting.findByOrFail('key', 'jenkins_job');

        const probeData = {
            ip: probeIp.value,
            vmName: vmName.value,
            swVersion: null,
            isAvailable: true,
            isOffline: false,
        }

        for (const j of jobs)
        {
            console.log(`Job ${j.id}`)
            console.log('created_at:', j.createdAt)
            console.log('remaining :', j.remaining)
        }

        /**
         * perform a simple check to see if probe is online and reachable
         */
        try {
            // const payload = await axios.get(`http://${probeIp.value}/probe/status`, { timeout: 3000 });

            if (activeJobsCount > 0) {
                probeData.isAvailable = false;
            }
            // if (!payload) {
            //     console.error('No response from probe.')
            //     probeData.isOffline = true;
            // }
            // const json = await parser.parseStringPromise(payload.data);
            // if (json && json.Status) {
            //     probeData.swVersion = json.Status.System[0].software_version;
            // }

            return view.render('landing', { jobs, probeData, jenkinsJob })

        } catch (error) {
            console.error('DB error!', error)
            console.log(error.code)
            console.log(error.errno)
            if (error.code === "ER_NO_SUCH_TABLE") {
                return response.send("Database table error. Check migrations and DB seed. (" + error.code + ")")
            }
            if (error.code === "ECONNREFUSED") {
                return response.send("Could not connect to database @ " + error.address + ":" + error.port);
            }
            if (error.code === "ECONNABORTED") {
                console.error(error)
                probeData.isOffline = true;
                const e = "Probe connection timed out."
                return view.render('landing', { jobs, probeData, error: e })
                return response.send("Probe connection timed out. Is probe online and reachable?\n" + "URL: " + error.config.url)

            }

            return response.send("Connection error: " + error.errcode)


        }

    }



    async edit_host({ view, request }: HttpContextContract) {
        const probeIp = await Setting.findBy('key', 'probe_ip')
        const jenkinsJob = await Setting.findBy('key', 'jenkins_job')
        const duration = await Setting.findBy('key', 'duration')
        const esxi_vmid = await Setting.findBy('key', 'esxi_vmid')
        const esxi_snapshot_id = await Setting.findBy('key', 'esxi_snapshot_id')
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

        return view.render('settings', {
            probeIp: probeIp?.value,
            jenkinsJob: jenkinsJob?.value,
            duration: duration?.value,
            esxi_vmid: esxi_vmid?.value,
            esxi_snapshot_id: esxi_snapshot_id?.value,
            jobs,
            error
        })
    }

    async update_host({ request, response, session }: HttpContextContract) {
        const { probeIp, jenkinsJob, duration, esxi_vmid, esxi_snapshot_id } = request.only([
            'probeIp',
            'jenkinsJob',
            'duration',
            'esxi_vmid',
            'esxi_snapshot_id'
        ])

        if (!probeIp || !probeIp.length) {
            return response.redirect().withQs({ error: 'Probe ip required' }).toRoute('edit.host')
        }

        try {
            await Setting.query().where('key', 'probe_ip').update({ value: probeIp });
            await Setting.query().where('key', 'jenkins_job').update({ value: jenkinsJob });
            await Setting.query().where('key', 'duration').update({ value: duration });
            await Setting.query().where('key', 'esxi_vmid').update({ value: esxi_vmid });
            await Setting.query().where('key', 'esxi_snapshot_id').update({ value: esxi_snapshot_id });
            session.flash('success', { description: 'Settings updated!' })
            return response.redirect('/')
        } catch (error) {
            console.error(error)
            return response.send(error)
        }


    }
}   
