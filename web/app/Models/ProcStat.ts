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
    // Get avg of all recorded procs w/same name
    const allProcStats = await ProcStat.query().where('name', procstat.name)
    const allMem = allProcStats.map(it => it.mem)
    const allCpu = allProcStats.map(it => it.cpu)


    const savedProcStatMem = Number(procstat.mem);
    const memStdDev = Number(std(allMem))
    const memoryAlert = savedProcStatMem > memStdDev;
    // const

    /**
     * Check if latest memory reading is above one standard deviation.
     */
    if (savedProcStatMem > memStdDev) {
      Logger.warn(`Above one standard deviation for memory. Latest memory reading is ${savedProcStatMem} (${memStdDev})`);
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
