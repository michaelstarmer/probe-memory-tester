import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Setting from 'App/Models/Setting'

export default class SettingsSeeder extends BaseSeeder {
  protected tableName = 'settings'
  public async run() {
    // Write your database queries inside the run method
    try {
      await Setting.createMany([
        { key: 'probe_ip', value: '10.0.28.239' },
        { key: 'vm_name', value: 'sw-probe-memtest' },
        { key: 'job_interval', value: '3000' },
        { key: 'jenkins_job', value: 'CentOS7-based_6.1' },

      ])
      console.log("Seeding complete: Settings");
    } catch (error) {
      console.error("seed Settings error!", error)
    }
  }
}
