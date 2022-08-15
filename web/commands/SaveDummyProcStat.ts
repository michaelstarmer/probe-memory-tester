import { BaseCommand, args, flags } from '@adonisjs/core/build/standalone'

const randomFloatBetween = (min, max) => {
  return parseFloat(Number(Math.random() * (max - min + 1) + min).toFixed(2));
}

export default class SaveDummyProcStat extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'save:procstat'

  @flags.string({ alias: 'n', description: 'Number of fake stats to add.' })
  public count: string

  @flags.string({ alias: 'j', description: 'Job id in which to save proc stat' })
  public jobId: string
  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Creates an instance of model ProcStat, and saves it to the database.'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest` 
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call 
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async createFakeProcStat(job) {
    const { default: ProcStat } = await import('App/Models/ProcStat');
    const psList: string[] = ['vidana', 'ewe', 'etr', 'dbana', 'capture', 'database', 'storage', 'flashserver', 'esyslog', 'ptt'];
    const psChoice = Math.floor(Math.random() * 10);

    try {
      await ProcStat.create({
        name: psList[psChoice],
        cpu: randomFloatBetween(1, 5),
        mem: randomFloatBetween(20, 30),
        jobId: job.id,
      });

      this.logger.success(`Fake ProcStat saved to job ${job.id}.`);

    } catch (error) {
      this.logger.error(`Error saving ProcStat to job ${job.id}.`);
      console.log(error)
      return null;
    }
  }


  public async run() {
    const { default: Job } = await import('App/Models/Job');

    this.logger.info('Attempting to save dummy ProcStat.');
    let jobs;

    /**
     * If a jobId is supplied as flag argument, then use this job.
     * In all other cases, default to the latest job.
     */
    if (this.jobId) {
      this.logger.info(`Fetching job w/id ${this.jobId}.`)
      jobs = await Job.query().where('id', this.jobId).limit(1);
    } else {
      this.logger.info('Defaulting to last job.')
      jobs = await Job.query().orderBy('createdAt', 'desc').limit(1)
    }

    if (!jobs || !jobs.length) {
      this.logger.error('No jobs found in jobs table.')
      return null;
    }

    const latestJob = jobs[0];

    if (this.count) {
      for (let i = 0; i < Number(this.count); i++) {
        await this.createFakeProcStat(latestJob);
      }
    } else {
      await this.createFakeProcStat(latestJob);
    }

  }
}
