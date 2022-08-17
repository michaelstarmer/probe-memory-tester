import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, computed, hasMany } from '@ioc:Adonis/Lucid/Orm'
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

  @column()
  public vulnCountHigh: number

  @column()
  public vulnCountMedium: number

  @column()
  public vulnCountLow: number

  @computed()
  public get vulnCountTotal() {
    let count = 0;

    if (this.vulnCountLow)
      count += this.vulnCountLow;
    if (this.vulnCountMedium)
      count += this.vulnCountMedium;
    if (this.vulnCountHigh)
      count += this.vulnCountHigh;

    return count;
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
