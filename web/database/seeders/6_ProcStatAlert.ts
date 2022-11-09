import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import ProcStatAlert from 'App/Models/ProcStatAlert'
import Job from 'App/Models/Job'
import ProcStat from 'App/Models/ProcStat'
const procStatAlerts = [

]

export default class ProcStatAlertSeeder extends BaseSeeder {

  public async run() {
    const jobs = await Job.query().preload('procStats')
    for (const job of jobs) {
      let randomIndex = Math.round(Math.random() * 10)
      let randomProcStat = job.procStats[randomIndex]
      console.log({ randomIndex, randomProcStat })
      console.log(`${job.procStats.length} proc stats registered to job ${job.id}`);
      try {

        await job.related('procStatAlerts').create({ procStatId: randomProcStat.id, type: randomIndex < 5 ? "low" : "medium", message: `${randomProcStat.name} had unusual activity.` })
      } catch (error) {
        console.error('could not create proc stat alerts')
      }
    }
  }
}
