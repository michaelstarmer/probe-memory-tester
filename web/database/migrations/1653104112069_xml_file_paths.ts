import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class XmlFilePaths extends BaseSchema {
  protected tableName = 'xml_files'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('original_filename').after('filename')
      table.string('filepath').after('original_filename')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('original_filename')
      table.dropColumn('filepath')
    })
  }
}
