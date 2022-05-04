import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class JobLog extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'jenkins_job' })
  public jenkinsJob: string

  @column({ columnName: 'build_number' })
  public buildNumber: number

  @column()
  public type: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
