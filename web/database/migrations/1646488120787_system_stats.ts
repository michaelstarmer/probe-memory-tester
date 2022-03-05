import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SystemStats extends BaseSchema {
  protected tableName = 'system_stats'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('job_id').unsigned().references('id').inTable('jobs')
      table.double('cpu').comment('percent')
      table.double('mem').comment('percent')
      table.text('alerts')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
