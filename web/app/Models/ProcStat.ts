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
    const allProcStats = await ProcStat.query().where('name', procstat.name)
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
      v['stdDev'] = Number(std(v.values));
      v['stdDevFactor'] = Math.floor(procstat[k] / procHistory[k].stdDev)
      if (procHistory[k].stdDevFactor !== undefined) {
        Logger.info(`${k} variance: value=${procstat[k]}, stdDev=${procHistory[k].stdDev} (${procHistory[k].stdDevFactor} standard deviations)`)
      }
      if (v['stdDevFactor'] >= 1) {
        Logger.info(`${k}: value outside normal range (${v['stdDevFactor']} SD).`);

        const newAlert = new ProcStat()
        newAlert['level'] = 'low';
        newAlert['message'] = `${procstat.name} ${k} value ${v['stdDevFactor']} standard deviations outside normal range.`

        if (v['stdDevFactor'] >= 2) {
          newAlert['level'] = 'medium';
        } else if (v['stdDevFactor'] >= 5) {
          newAlert['level'] = 'high';
        }

        console.log(newAlert['message'])
        try {
          await newAlert.save();
          Logger.info('New ProcStatAlert saved!')
        } catch (error) {
          console.error(error);
        }
      }

    }
    return

    const savedProcStatMem = Number(procstat.mem);
    const savedProcStatCpu = Number(procstat.cpu)
    const memStdDev = Number(std(allMem))
    const cpuStdDev = Number(std(allCpu))

    if (savedProcStatMem > memStdDev) {
      const stdDevFactor = Math.floor(savedProcStatMem / memStdDev);
      Logger.info(`Value=${savedProcStatMem}, StdDev=${memStdDev.toFixed(2)} (${stdDevFactor} standard deviations)`);
      try {
        await ProcStatAlert.create({
          procStatId: procstat.id,
          level: 'medium',
          message: 'Above one standard deviation'
        })
      } catch (error) {
        Logger.error('Failed to created ProcStatAlert')
        console.log(error);
      }
      Logger.info('Added new alert.')
    } else {
      Logger.info(`Within one standard deviation. Latest memory reading is ${savedProcStatMem}. Std: (${memStdDev})`)
    }

  }


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => ProcStatAlert)
  public alert: HasOne<typeof ProcStatAlert>
}
