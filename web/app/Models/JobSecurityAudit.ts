import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Job from 'App/Models/Job'

export default class JobSecurityAudit extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'job_id' })
  public jobId: Number

  @belongsTo(() => Job)
  public job: BelongsTo<typeof Job>

  @column()
  public progress: Number

  @column({ columnName: 'in_use' })
  public inUse: boolean

  @column()
  public pdf: string

  @column({ columnName: 'cve_low_severity' })
  public cveLow: number

  @column({ columnName: 'cve_medium_severity' })
  public cveMedium: number

  @column({ columnName: 'cve_heigh_severity' })
  public cveHigh: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
