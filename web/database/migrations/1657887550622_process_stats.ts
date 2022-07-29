import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ProcessStats extends BaseSchema {
  protected tableName = 'process_stats'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('process')
      table.integer('job_id').unsigned().notNullable().references('id').inTable('jobs')
      table.double('cpu').comment('percent')
      table.double('mem').comment('percent')
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
