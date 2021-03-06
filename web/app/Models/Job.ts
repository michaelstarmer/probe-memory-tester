import { DateTime } from 'luxon'
import { BaseModel, beforeSave, BelongsTo, belongsTo, column, HasMany, hasMany, HasOne, hasOne, scope } from '@ioc:Adonis/Lucid/Orm'
import XmlFile from './XmlFile'
import SystemStat from './SystemStat'
import BtechProc from './BtechProc'

export default class Job extends BaseModel {

  @column({ isPrimary: true })
  public id: number

  @column()
  public memory: number

  @column({ columnName: 'xml_file_id', serializeAs: null })
  public xmlFileId: string

  @belongsTo(() => XmlFile, {serializeAs: 'xmlConfig'})
  public xmlConfig: BelongsTo<typeof XmlFile>

  @column()
  public status: string

  @column.dateTime()
  public startAt: DateTime

  @beforeSave()
  public static async checkStartTime (job: Job)
  {
    if (!job.$dirty.startAt)
    {
      job.startAt = DateTime.now()
    }
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => SystemStat)
  public systemStats: HasMany<typeof SystemStat>

  @hasMany(() => BtechProc)
  public btechProcs: HasMany<typeof BtechProc>

  public static ignoreCompleted = scope((query) => {
    query.whereNot('status', 'completed')
  })

  public static onlyRunning = scope((query) => {
    query.where('status', 'running')
  })

  public static onlyWaiting = scope((query) => {
    query.where('status', 'waiting')
  })

  // @beforeFind()
  // public static ignoreCompleted (query: ModelQueryBuilderContract<typeof Job>) {
  //   query.whereNull('completed_at') 
  // }
}
