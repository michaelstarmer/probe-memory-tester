import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Statuses extends BaseSchema {
  protected tableName = 'jobs'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('status', [ 'waiting', 'initializing', 'running', 'completed', 'failed' ]).notNullable().defaultTo('waiting').alter()

    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('status', [ 'waiting', 'running', 'completed', 'failed' ]).notNullable().defaultTo('waiting').alter()
    })
  }
}
