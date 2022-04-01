import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import ProbeConfig from 'App/Models/ProbeConfig'

export default class ProbeConfigSeeder extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    try {
      await ProbeConfig.createMany([
        { key: 'probe_ip', value: '' },
        { key: 'vm_name', value: 'sw-probe-memtest' },
        { key: 'job_interval', value: '3000' },

      ])
      console.log("Seeding complete: ProbeConfig");
    } catch (error) {
      console.error("seed config error!", error)
    }
  }
}
