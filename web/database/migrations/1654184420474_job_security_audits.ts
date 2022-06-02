import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class JobSecurityAudits extends BaseSchema {
  protected tableName = 'job_security_audits'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('job_id').unsigned().references('id').inTable('jobs')
      table.integer('progress', 3).defaultTo(0)
      table.boolean('in_use').defaultTo(true)
      table.integer('cve_low_severity').defaultTo(0)
      table.integer('cve_medium_severity').defaultTo(0)
      table.integer('cve_heigh_severity').defaultTo(0)
      table.string('pdf')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
