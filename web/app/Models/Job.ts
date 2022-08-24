import { DateTime } from 'luxon'
import { BaseModel, beforeSave, BelongsTo, belongsTo, column, HasMany, hasMany, HasOne, hasOne, scope, computed, afterFind } from '@ioc:Adonis/Lucid/Orm'
import XmlFile from './XmlFile'
import SystemStat from './SystemStat'
import Snapshot from './Snapshot'
import JobLog from './JobLog'
import JobSecurityAudit from './JobSecurityAudit'
import ProcStat from './ProcStat'
import ProcStatAlert from './ProcStatAlert'

export default class Job extends BaseModel {

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
  public jenkinsJob: string

  @column()
  public gitCommit: string | null

  @column()
  public buildNumber: Number | null

  @computed()
  public get gitCommitShort() {
    if (!this.gitCommit || this.gitCommit.length < 1)
      return;
    return this.gitCommit.substring(0, 8);
  }

  @belongsTo(() => Snapshot)
  public snapshot: BelongsTo<typeof Snapshot>

  @column()
  public status: string

  @column()
  public duration: number

  @column()
  public isManual: boolean

  @computed()
  public get remaining() {
    if (!this.startedAt)
      return

    if (this.status === "running") {
      return Math.ceil(this.startedAt.plus({ minutes: this.duration }).diffNow().as('minutes'))
    }
  }

  @column.dateTime({ autoUpdate: false })
  public startedAt: DateTime | null

  @afterFind()
  public static async checkJobStatus(job: Job) {
    const isExpired = job.startedAt && job.startedAt.plus({ minutes: job.duration }).diffNow().as('minutes') <= 0;
    if (isExpired) {
      // const log = new JobLog()
      // log.type = 'info';
      // log.message = 'Test finished.'
      // await job.related('logs').save(log);
      if (job.status !== 'completed') {
        job.status = "completed"
        await job.save()
      }
    }
  }

  @beforeSave()
  public static async checkStartTime(job: Job) {
    // check for status change. if set to 'running', add timestamp to startedAt 
    if (job.$dirty.status === 'running') {
      job.startedAt = DateTime.now()
    }

    // if job status is pushed back, also remove started_at
    if (job.$dirty.status === 'waiting') {
      job.startedAt = null;
    }
  }

  @column.dateTime({ autoCreate: true, autoUpdate: false, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: false, serializeAs: null })
  public updatedAt: DateTime

  @hasMany(() => SystemStat)
  public systemStats: HasMany<typeof SystemStat>

  @hasMany(() => JobLog)
  public logs: HasMany<typeof JobLog>

  @hasMany(() => ProcStat)
  public procStats: HasMany<typeof ProcStat>

  @hasMany(() => ProcStatAlert, { foreignKey: 'jobId' })
  public procStatAlerts: HasMany<typeof ProcStatAlert>

  @hasOne(() => JobSecurityAudit)
  public securityAudit: HasOne<typeof JobSecurityAudit>

  public static ignoreCompleted = scope(query => query.whereNot('status', 'completed'))
  public static onlyRunning = scope(query => query.where('status', 'running'))
  public static onlyWaiting = scope(query => query.where('status', 'waiting'))

}
