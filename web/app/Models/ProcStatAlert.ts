import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, hasOne } from '@ioc:Adonis/Lucid/Orm'
import ProcStat from './ProcStat'

export default class ProcStatAlert extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'proc_stat_id' })
  public procStatId: Number

  @column()
  public type: string

  @column()
  public message: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => ProcStat)
  public procStat: BelongsTo<typeof ProcStat>


}
