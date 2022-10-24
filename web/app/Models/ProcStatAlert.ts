import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import ProcStat from './ProcStat'
import Job from './Job'

export default class ProcStatAlert extends BaseModel {
  protected tableName = 'proc_stat_alerts';
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'job_id' })
  public jobId: number

  @column({ columnName: 'proc_stat_id' })
  public procStatId: number

  @column()
  public level: string

  @column()
  public message: string

  @column.dateTime({
    autoCreate: true,
    serialize: (value: DateTime | null) => {
      return value ? value.setLocale('no').toFormat('f') : value
    },
  })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => ProcStat)
  public procStat: BelongsTo<typeof ProcStat>

  @belongsTo(() => Job)
  public job: BelongsTo<typeof Job>


}
