import { DateTime } from 'luxon'
import { BaseModel, beforeSave, BelongsTo, belongsTo, column, HasMany, hasMany, HasOne, hasOne, scope, computed } from '@ioc:Adonis/Lucid/Orm'
import XmlFile from './XmlFile'
import SystemStat from './SystemStat'
import BtechProc from './BtechProc'
import moment from 'moment'
import { format, subMinutes } from 'date-fns'

export default class Job extends BaseModel {

  @column({ isPrimary: true })
  public id: number

  @column()
  public memory: number

  @column({ columnName: 'xml_file_id', serializeAs: null })
  public xmlFileId: string

  @belongsTo(() => XmlFile, { serializeAs: 'xmlConfig' })
  public xmlConfig: BelongsTo<typeof XmlFile>

  @column()
  public status: string

  @column()
  public duration: Number

  @computed()
  public get remaining() {
    const _start = this.startAt.toJSDate()
    const _end = moment(_start).add(String(this.duration), 'minutes')
    const _now = moment()
    const diffMinutes = _end.diff(_now, 'minutes')

    return diffMinutes > 0 ? diffMinutes : 0;
  }

  @column.dateTime()
  public startAt: DateTime

  @beforeSave()
  public static async checkStartTime(job: Job) {
    if (!job.$dirty.startAt) {
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
