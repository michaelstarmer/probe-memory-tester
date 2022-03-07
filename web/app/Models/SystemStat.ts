import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Job from './Job'

export default class SystemStat extends BaseModel {
  static get dates () {
    return super.dates.concat(['data_emissao'])
  }

  static formatDates (field, value) {
    if (field === 'data_emissao') {
        return value.format('DD-MM-YYYY')
      }
    return super.formatDates(field, value)
}

  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'job_id' })
  public jobId: number

  @belongsTo(() => Job)
  public job: BelongsTo<typeof Job>

  @column()
  public cpu: number

  @column()
  public mem: number

  @column()
  public alerts: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
