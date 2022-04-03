import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Snapshots extends BaseSchema {
  protected tableName = 'snapshots'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('snapshot_id').notNullable()
      table.string('name').notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
