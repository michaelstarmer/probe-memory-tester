import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Jobs extends BaseSchema {
  protected tableName = 'jobs'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('memory').notNullable()
      table.integer('xml_file_id').unsigned().references('id').inTable('xml_files')
      table.enum('status', ['waiting', 'running', 'completed', 'failed']).notNullable().defaultTo('waiting')
      table.datetime('start_at')
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
