import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ProcStatAlerts extends BaseSchema {
  protected tableName = 'proc_stat_alerts'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('level', 'type')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
