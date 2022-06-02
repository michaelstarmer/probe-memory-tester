import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Job from 'App/Models/Job'

export default class JobSecurityAudit extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'job_id' })
  public jobId: Number

  @column({ columnName: 'gvm_report_id' })
  public gvmReportId: string

  @belongsTo(() => Job)
  public job: BelongsTo<typeof Job>

  @column()
  public progress: Number

  @column({ columnName: 'in_use' })
  public inUse: boolean

  @column()
  public status: string

  @column()
  public pdf: string

  @column()
  public vulns: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
