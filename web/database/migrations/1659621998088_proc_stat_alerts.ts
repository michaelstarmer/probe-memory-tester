import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ProcStatAlerts extends BaseSchema {
  protected tableName = 'proc_stat_alerts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('proc_stat_id').unsigned().references('id').inTable('proc_stats')
      table.integer('job_id').unsigned().references('id').inTable('jobs')
      table.enum('level', ['low', 'medium', 'high']).notNullable()
      table.string('message').notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
