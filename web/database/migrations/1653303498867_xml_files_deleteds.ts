import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class XmlFilesDeleteds extends BaseSchema {
  protected tableName = 'xml_files'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_archived').defaultTo(false).after('description')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, table => {
      table.dropColumn('is_archived')
    })
  }
}
