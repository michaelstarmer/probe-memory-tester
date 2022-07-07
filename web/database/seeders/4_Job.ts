import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Job from 'App/Models/Job'
import JobLog from 'App/Models/JobLog'
import SystemStat from 'App/Models/SystemStat'
import { DateTime } from 'luxon'

export default class JobSeeder extends BaseSeeder {
  public async run() {

    const jobs: object[] = [
      {
        memory: 4,
        cpu: 0,
        xmlFileId: 2,
        jenkinsJob: 'CentOS7-based_6.1',
        buildNumber: 1,
        isManual: 0,
        status: 'completed',
        duration: 60
      },
      {
        memory: 4,
        cpu: 0,
        xmlFileId: 2,
        jenkinsJob: 'CentOS7-based_6.1',
        buildNumber: 4,
        isManual: 1,
        status: 'completed',
        duration: 60
      },
      {
        memory: 4,
        cpu: 0,
        xmlFileId: 2,
        jenkinsJob: 'CentOS7-based_6.1',
        buildNumber: 10,
        isManual: 0,
        status: 'completed',
        duration: 60
      },
      {
        memory: 4,
        cpu: 0,
        xmlFileId: 2,
        jenkinsJob: 'CentOS7-based_6.1',
        buildNumber: 11,
        isManual: 1,
        status: 'running',
        duration: 60
      },
      {
        memory: 4,
        cpu: 0,
        xmlFileId: 2,
        jenkinsJob: 'CentOS7-based_6.1',
        buildNumber: 12,
        isManual: 0,
        status: 'waiting',
        duration: 60
      },
      {
        memory: 6,
        cpu: 0,
        xmlFileId: 2,
        jenkinsJob: 'CentOS7-based_6.0',
        buildNumber: 1,
        isManual: 1,
        status: 'waiting',
        duration: 30
      },
    ];

    let initialDateTime = DateTime.now().minus({ days: jobs.length })

    for (let [idx, job] of jobs.entries()) {
      job['createdAt'] = initialDateTime.plus({ days: idx })
    }

    try {
      for (const job of jobs) {
        console.log('Creating new job...')
        const newJob = await Job.create(job);
        const jobLogs: object[] = [
          { type: 'info', message: 'Preparing new test environment' },
          { type: 'info', message: 'Reverting to default snapshot' },
          { type: 'info', message: 'Pinging probe...' },
          { type: 'info', message: 'Probe is back online.' },
          { type: 'info', message: 'Initialization complete.' },
        ];
        for (const log of jobLogs) {
          await newJob.related('logs').create(log);
        }

        /**
         * Add random number (1-20) of system stats and set random cpu/mem (1.00-10.00) values
         */
        const statsTotalCount = Math.round(Math.random() * 20);
        console.log(`Adding ${statsTotalCount} to job`)

        for (let i = 0; i < statsTotalCount; i++) {
          await newJob.related('systemStats').create(
            {
              cpu: Math.random() * 10,
              mem: Math.random() * 10,
              createdAt: initialDateTime.plus({ days: i, minutes: Math.round(Math.random() * 60) })
            }
          );
        }
      }
      console.log('Seeding complete: Job')
    } catch (error) {
      console.error('Seeding failed: Job', error)
    }
  }
}
