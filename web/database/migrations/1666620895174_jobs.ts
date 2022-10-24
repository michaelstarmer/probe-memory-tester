import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Jobs extends BaseSchema {
  protected tableName = 'jobs'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('dash_version').after('jenkins_job')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, table => {
      table.dropColumn('dash_version')
    })
  }
}
