import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DateTime } from 'luxon'

export default class Jobs extends BaseSchema {
  protected tableName = 'jobs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('memory').notNullable()
      table.integer('cpu')
      table.integer('xml_file_id').unsigned().references('id').inTable('xml_files')
      table.integer('version')
      table.enum('status', ['waiting', 'running', 'completed', 'failed']).notNullable().defaultTo('waiting')
      table.integer('duration').comment('minutes')
      table.timestamp('start_at').nullable()
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
