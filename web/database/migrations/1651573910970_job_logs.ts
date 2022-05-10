import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class JobsLogs extends BaseSchema {
  protected tableName = 'job_logs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('job_id').unsigned().references('id').inTable('jobs')
      table.enum('type', ['info', 'warn', 'error'])
      table.text('message')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
