import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ProcStats extends BaseSchema {
  protected tableName = 'proc_stats'

  public async up() {
    // this.schema.alterTable('system_stats', table => {
    //   table.dropColumn('ewe_cpu')
    //   table.dropColumn('ewe_mem')
    //   table.dropColumn('etr_cpu')
    //   table.dropColumn('etr_mem')
    //   table.dropColumn('ott_cpu')
    //   table.dropColumn('ott_mem')
    //   table.dropColumn('vidana_cpu')
    //   table.dropColumn('vidana_mem')
    // })
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name')
      table.integer('job_id').unsigned().references('id').inTable('jobs')
      table.double('mem')
      table.double('cpu')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
