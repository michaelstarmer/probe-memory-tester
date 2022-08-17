import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterJobSecurityAudits extends BaseSchema {
  protected tableName = 'job_security_audits'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('vuln_count_low').nullable().after('pdf')
      table.integer('vuln_count_medium').nullable().after('pdf')
      table.integer('vuln_count_high').nullable().after('pdf')
      table.dropColumn('vulns')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, table => {
      table.dropColumns('vuln_count_high', 'vuln_count_medium', 'vuln_count_low')
      table.integer('vulns')
    })
  }
}
