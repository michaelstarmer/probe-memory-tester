import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class BtechProcs extends BaseSchema {
  protected tableName = 'btech_procs'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('job_id').unsigned().references('id').inTable('jobs')
      table.string('name').notNullable()
      table.string('result').notNullable()
      table.integer('count')
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
