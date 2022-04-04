import { DateTime } from 'luxon'
import { BaseModel, beforeSave, BelongsTo, belongsTo, column, HasMany, hasMany, HasOne, hasOne, scope, computed, beforeFetch, ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'
import XmlFile from './XmlFile'
import SystemStat from './SystemStat'
import moment, { duration } from 'moment'
import { format, subMinutes } from 'date-fns'
import Snapshot from './Snapshot'

export default class Job extends BaseModel {

  // static get 

  @column({ isPrimary: true })
  public id: number

  @column()
  public memory: number

  @column()
  public cpu: number

  @column({ columnName: 'xml_file_id', serializeAs: null })
  public xmlFileId: string

  @belongsTo(() => XmlFile, { serializeAs: 'xmlConfig' })
  public xmlConfig: BelongsTo<typeof XmlFile>

  @column()
  public version: Number

  @belongsTo(() => Snapshot)
  public snapshot: BelongsTo<typeof Snapshot>

  @column()
  public status: string

  @column()
  public duration: number

  @computed()
  public get remaining() {
    if (!this.startAt)
      return
    console.log('startAt:', this.startAt)
    let _start = this.startAt
    const _end = moment(_start).add(String(this.duration), 'minutes')
    const _now = moment()
    const diffMinutes = _end.diff(_now, 'minutes')

    if (diffMinutes <= 0) {
      return 0;
    }

    return diffMinutes;
  }

  @column.dateTime({ autoUpdate: false })
  public startAt: DateTime

  @beforeSave()
  public static async checkStartTime(job: Job) {
    if (!job.startAt && !job.$dirty.startAt) {
      job.startAt = DateTime.now()
    }

    if (job.startAt.plus({ minutes: job.duration }).diffNow('minutes').minutes >= 0) {
      console.log('Job is expired. Setting complete')
      job.status = "completed"
    }
  }

  @column.dateTime({ autoCreate: true, autoUpdate: false })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: false })
  public updatedAt: DateTime
  /*  */
  @hasMany(() => SystemStat)
  public systemStats: HasMany<typeof SystemStat>

  public static ignoreCompleted = scope((query) => {
    query.whereNot('status', 'completed')
  })

  public static onlyRunning = scope((query) => {
    query.where('status', 'running')
  })

  public static onlyWaiting = scope((query) => {
    query.where('status', 'waiting')
  })

  // @beforeFetch()
  // public static async updateStatus (query: ModelQueryBuilderContract<typeof Job>) {
  //   query.whereIn('status', ['waiting', 'running']).andWhere('duration',)

  // }
}
