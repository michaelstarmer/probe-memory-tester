import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ProcStats extends BaseSchema {
  protected tableName = 'system_stats'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('alerts')
      table.double('ewe_cpu').after('mem')
      table.double('ewe_mem').after('ewe_cpu')
      table.double('etr_cpu').after('ewe_mem')
      table.double('etr_mem').after('etr_cpu')
      table.double('ott_cpu').after('etr_mem')
      table.double('ott_mem').after('ott_cpu')
      table.double('vidana_cpu').after('ott_mem')
      table.double('vidana_mem').after('vidana_cpu')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, table => {
      table.text('alerts').after('mem')
      table.dropColumn('ewe_cpu')
      table.dropColumn('ewe_mem')
      table.dropColumn('etr_cpu')
      table.dropColumn('etr_mem')
      table.dropColumn('ott_cpu')
      table.dropColumn('ott_mem')
      table.dropColumn('vidana_cpu')
      table.dropColumn('vidana_mem')
    })
  }
}
