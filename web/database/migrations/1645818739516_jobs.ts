import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Jobs extends BaseSchema {
  protected tableName = 'jobs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('memory').notNullable()
      table.integer('cpu')
      table.integer('xml_file_id').unsigned().references('id').inTable('xml_files')
      table.string('jenkins_job')
      table.integer('build_number')
      table.boolean('is_manual').defaultTo(false)
      table.enum('status', ['waiting', 'running', 'completed', 'failed']).notNullable().defaultTo('waiting')
      table.integer('duration').comment('minutes')
      table.timestamp('started_at').nullable()
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
