import { DateTime } from 'luxon'
import { afterSave, BaseModel, BelongsTo, belongsTo, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Job from 'App/Models/Job'
import ProcStatAlert from './ProcStatAlert'
import { std } from 'mathjs'
import Logger from '@ioc:Adonis/Core/Logger'

export default class ProcStat extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'job_id' })
  public jobId: number

  @belongsTo(() => Job)
  public job: BelongsTo<typeof Job>

  @column()
  public name: string

  @column()
  public mem: number

  @column()
  public cpu: number

  @afterSave()
  public static async calculateDeviations(procstat: ProcStat) {
    /**
     * Compare the saved proc_stat to the standard deviation of the same process values for all other similar jobs.
     * If the value exceeds X times standard deviation, create a new ProcStatAlert.
     * ProcStatAlert uses [low, medium, high] to classify the level of deviation.
     */


    if (!procstat.name)
      return
    const allProcStats = await ProcStat.query().where('name', procstat.name)
    console.log(procstat.name)

    if (!allProcStats || allProcStats.length < 1) {
      return;
    }
    const allMem = allProcStats.map(it => it.mem)
    const allCpu = allProcStats.map(it => it.cpu)

    const procHistory = {
      mem: {
        stdDev: 0,
        stdDevFactor: 0,
        values: allProcStats.map(it => it.mem)
      },
      cpu: {
        stdDev: 0,
        stdDevFactor: 0,
        values: allProcStats.map(it => it.cpu),
      }
    }

    for (const [k, v] of Object.entries(procHistory)) {
      v['stdDev'] = Number(Number(std(v.values)).toFixed(2));
      v['stdDevFactor'] = Number(Math.floor(procstat[k] / procHistory[k].stdDev))
      if (procHistory[k].stdDevFactor !== undefined) {
        Logger.info(`${k} variance: value=${procstat[k]}, stdDev=${procHistory[k].stdDev} (${procHistory[k].stdDevFactor} standard deviations)`)
      }
      if (v['stdDevFactor'] < 1) {
        continue
      }

      Logger.info(`${k}: value outside normal range (${v['stdDevFactor']} SD).`);

      const newAlert = {}
      newAlert['level'] = 'low';
      newAlert['message'] = `${procstat.name} ${k} value ${v['stdDevFactor']} standard deviations outside normal range.`
      newAlert['jobId'] = procstat.jobId;
      newAlert['procStatId'] = procstat.id;

      if (v['stdDevFactor'] >= 2) {
        newAlert['level'] = 'medium';
      } else if (v['stdDevFactor'] >= 5) {
        newAlert['level'] = 'high';
      }

      console.log(newAlert['message'])
      console.log(procstat.jobId)
      console.log(procstat.id)
      try {
        await ProcStatAlert.create(newAlert);
        Logger.info('New ProcStatAlert saved!')
      } catch (error) {
        console.error(error);
      }


    }


  }


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => ProcStatAlert)
  public alert: HasOne<typeof ProcStatAlert>
}
