import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from 'App/Models/Job'
import ProbeConfig from 'App/Models/ProbeConfig'
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

        const probeIp = await ProbeConfig.findByOrFail('key', 'probe_ip')
        const vmName = await ProbeConfig.findByOrFail('key', 'vm_name');
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
        const config = await ProbeConfig.all()
        config.forEach(it => payload[it.key] = it.value)
        return response.json(payload)
    }

    async edit_host({ view, request }: HttpContextContract) {
        const probeIp = await ProbeConfig.findBy('key', 'probe_ip')
        const { error } = request.all();
        console.log(error)
        return view.render('edit-host', {
            probeIp: probeIp?.value,
            error
        })
    }

    async update_host({ request, response }: HttpContextContract) {
        const { probeIp } = request.only(['probeIp'])

        if (!probeIp || !probeIp.length) {
            return response.redirect().withQs({ error: 'Probe ip required' }).toRoute('edit.host')
        }

        try {
            await ProbeConfig.query().where('key', 'probe_ip').update({ value: probeIp });
            return response.redirect().toRoute('home')
        } catch (error) {
            console.error(error)
            return response.send(error)
        }


    }
}   
