import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import XmlFile from 'App/Models/XmlFile';

export default class XmlFileSeeder extends BaseSeeder {
  public async run () {
    try {
      await XmlFile.createMany([
        { 
          filename: '/app/probe_xml/heavy-config.xml',
          description: `Load: HEAVY
2000 multicast streams`
        },
        {
          filename: '/app/probe_xml/medium-config.xml',
          description: `Load: MEDIUM
100 multicasts, 1 OTT channel`
        },
        {
          filename: '/app/probe_xml/light-config.xml',
          description: `Load: LIGHT
100 multicast streams`
        },
      ])
      console.log("Seeding complete: XmlFile");
    } catch (error) {
      console.error("seed config error!", error)
    }
  }
}
