import { DateTime } from 'luxon'
import { BaseModel, beforeSave, BelongsTo, belongsTo, column, HasMany, hasMany, HasOne, hasOne, scope, computed, afterFind } from '@ioc:Adonis/Lucid/Orm'
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

    // const isExpired = this.startAt.plus({ minutes: this.duration }).diffNow().as('minutes') <= 0;
    // const isWaiting = this.startAt.diffNow().as('minutes') > 0;
    // const minutesRemaining = this.startAt.plus({ minutes: this.duration }).diffNow().as('minutes');

    // if (!isExpired && !isWaiting) {
    //   return
    // }

    // if (isWaiting) {
    //   console.log('Job is waiting.')
    //   return
    // }
    if (this.status === "running") {
      return Math.ceil(this.startAt.plus({ minutes: this.duration }).diffNow().as('minutes'))
    }

  }

  @column.dateTime({ autoUpdate: false })
  public startAt: DateTime

  @afterFind()
  public static async checkJobStatus(job: Job) {
    const isExpired = job.startAt.plus({ minutes: job.duration }).diffNow().as('minutes') <= 0;

    if (isExpired) {
      job.status = "completed"
      await job.save()
    }
  }

  @beforeSave()
  public static async checkStartTime(job: Job) {
    if (!job.startAt && !job.$dirty.startAt) {
      job.startAt = DateTime.now()
    }
  }

  @column.dateTime({ autoCreate: true, autoUpdate: false, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: false, serializeAs: null })
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

}
