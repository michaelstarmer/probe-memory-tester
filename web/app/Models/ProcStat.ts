import { DateTime } from 'luxon'
import { afterSave, BaseModel, BelongsTo, belongsTo, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Job from 'App/Models/Job'
import ProcStatAlert from 'App/Models/ProcStatAlert'
import { std } from 'mathjs'
import Logger from '@ioc:Adonis/Core/Logger'
import Database from '@ioc:Adonis/Lucid/Database'
import JobLog from './JobLog'
import Redis from '@ioc:Adonis/Addons/Redis'

export default class ProcStat extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'job_id' })
  public jobId: number

  @belongsTo(() => Job)
  public job: BelongsTo<typeof Job>

  @column()
  public name: string

  @column()
  public mem: number

  @column()
  public cpu: number

  @afterSave()
  public static async calculateDeviations(procstat: ProcStat) {
    /**
     * Compare the saved proc_stat to the standard deviation of the same process values for all other similar jobs.
     * If the value exceeds X times standard deviation, create a new ProcStatAlert.
     * ProcStatAlert uses [low, medium, high] to classify outlier values.
     */


    if (!procstat.name)
      return
    // const allProcStats = await ProcStat.query().where('name', procstat.name)
    await procstat.load('job')

    /**
     * Find all ProcStats in database with:
     *  - the same name (eg. vidana)
     *  - belonging to a job of the same type (eg. CentOS7-based_6.0)
     */
    const allProcStatsQuery = await Database.rawQuery(`SELECT PS.id, PS.name, PS.mem, PS.cpu, PS.created_at, PS.updated_at FROM proc_stats PS
LEFT JOIN jobs J ON J.id = PS.job_id
WHERE PS.name = '${procstat.name}' AND J.jenkins_job = '${procstat.job.jenkinsJob}'`);

    let msg = `Comparing with previous procstats for: ${procstat.name}, AND only using history from job type: ${procstat.job.jenkinsJob}`;
    Logger.info(msg)

    let allProcStats;
    if (allProcStatsQuery && allProcStatsQuery.length > 0) {
      allProcStats = allProcStatsQuery[0];
    } else {
      Logger.info(`No job history for process ${procstat.name} at job of type ${procstat.job.jenkinsJob}`)
    }

    if (!allProcStats || allProcStats.length < 1) {
      return;
    }

    const procHistory = {
      mem: {
        stdDev: 0,
        stdDevFactor: 0,
        values: allProcStats.map(it => it.mem)
      },
      cpu: {
        stdDev: 0,
        stdDevFactor: 0,
        values: allProcStats.map(it => it.cpu),
      }
    }

    for (const [k, v] of Object.entries(procHistory)) {
      if (!procstat[k] || procstat[k] < 1) {
        Logger.info(`${procstat.name}'s latest ${k} below 1. Not checking for variance.`)
        continue
      }
      v['stdDev'] = Number(std(v.values));
      if (!v['stdDev'] || v['stdDev'] < 1) {
        Logger.info(`${procstat.name}'s latest ${k} reading is normal.`)
        continue
      }
      v['stdDevFactor'] = Number(Math.floor(procstat[k] / procHistory[k].stdDev))
      if (!v['stdDevFactor'] || v['stdDevFactor'] < 1) {
        Logger.info(`${k} variance: value=${procstat[k]}, stdDev=${procHistory[k].stdDev} (${procHistory[k].stdDevFactor} standard deviations)`)
        continue
      }


      const recentAlertSpanMinutes = 5;

      const r1 = await Database.rawQuery(`
SELECT A.id, A.type, A.message, A.created_at FROM proc_stat_alerts A
LEFT JOIN proc_stats S ON S.id = A.proc_stat_id
WHERE S.name = "${procstat.name}"
AND A.created_at > '${DateTime.now().minus({ minutes: recentAlertSpanMinutes }).toSQL()}
AND S.job_id = ${procstat.jobId}'
`)
      let hasRecentSimilarAlert = false;
      if (r1) {
        if (r1[0] && r1[0].length > 0) {
          console.log(r1[0])
          hasRecentSimilarAlert = true;
        }
      }

      if (hasRecentSimilarAlert) {
        Logger.info(`Found existing alert on process ${procstat.name} from within last ${recentAlertSpanMinutes} minutes. Not adding new alert.`)
        continue;
      }

      Logger.info(`${k}: value outside normal range (${v['stdDevFactor']} SD).`);
      let alertType = 'low';


      if (v['stdDevFactor'] >= 5) {
        alertType = 'medium';
      } else if (v['stdDevFactor'] >= 10) {
        alertType = 'high';
      }

      const newAlert = {
        message: `${procstat.name} ${k} value ${v['stdDevFactor']} standard deviations outside normal range.`,
        jobId: procstat.jobId,
        procStatId: procstat.id,
        type: alertType,
      }

      try {
        console.log(newAlert)
        const savedAlert = await ProcStatAlert.create(newAlert);
        if (!savedAlert) {
          Logger.error('Failed to save new alert.')
          await JobLog.create({ jobId: procstat.jobId, type: 'warn', message: 'Failed to save ProcStat alert. Check API logs.' })
        } else {
          Logger.info('New ProcStatAlert saved!')
        }
      } catch (error) {
        Logger.error('failed to save alert.')
        console.error(error);
        await JobLog.create({ jobId: procstat.jobId, type: 'warn', message: 'Failed to save ProcStat alert. Check API logs.' })
      }


    }
  }



  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @hasOne(() => ProcStatAlert)
  public alert: HasOne<typeof ProcStatAlert>
}
