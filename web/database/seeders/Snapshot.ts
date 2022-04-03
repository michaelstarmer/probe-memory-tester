import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Snapshot from 'App/Models/Snapshot';

export default class SnapshotSeeder extends BaseSeeder {
  public async run () {
    try {
      await Snapshot.createMany([
        {
          snapshotId: 1,
          name: '5.6.0-11' 
        },
        {
          snapshotId: 2,
          name: '6.0.0-2'
        },
        {
          snapshotId: 3,
          name: '6.1.0-RC1'
        },
        {
          snapshotId: 4,
          name: '6.1'
        },

      ])
      console.log("Seeding complete: XmlFile");
    } catch (error) {
      console.error("seed config error!", error)
    }
  }
}
