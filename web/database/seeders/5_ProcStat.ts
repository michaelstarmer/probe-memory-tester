import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Job from 'App/Models/Job'
import ProcStat from 'App/Models/ProcStat'

const procStats = [
  { name: 'vidana', jobId: 0, mem: 21.8, cpu: 0.4 },
  { name: 'storage', jobId: 0, mem: 0, cpu: 0 },
  { name: 'sap', jobId: 0, mem: 0, cpu: 0 },
  { name: 'relay', jobId: 0, mem: 0, cpu: 0.4 },
  { name: 'psi', jobId: 0, mem: 0.2, cpu: 0 },
  { name: 'ptt', jobId: 0, mem: 12.6, cpu: 0.9 },
  { name: 'microbitr', jobId: 0, mem: 0, cpu: 0 },
  { name: 'flashserver', jobId: 0, mem: 0, cpu: 0 },
  { name: 'ewe', jobId: 0, mem: 1.6, cpu: 1.8 },
  { name: 'etr', jobId: 0, mem: 0.6, cpu: 4.7 },
  { name: 'esyslog', jobId: 0, mem: 0, cpu: 0 },
  { name: 'dbana', jobId: 0, mem: 0, cpu: 0 },
  { name: 'database', jobId: 0, mem: 0, cpu: 1.2 },
  { name: 'capture', jobId: 0, mem: 0, cpu: 0.4 },
  { name: 'ana', jobId: 0, mem: 0.1, cpu: 0.4 },
];

export default class ProcStatSeeder extends BaseSeeder {
  public async run () {
    const jobs = await Job.all();
    for (const job of jobs)
    {
      procStats.map(it => it.jobId = job.id);
      try {
        console.log(`Adding ${procStats.length} proc_stats for job ${job.id}`)
        await job.related('procStats').createMany(procStats);
      } catch (error) {
        console.error(`Failed to add proc_stats to job (id ${job.id})`)
      }
    }
  }
}
