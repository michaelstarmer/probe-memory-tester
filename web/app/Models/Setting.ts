import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Settings extends BaseModel {
  protected tableName = 'settings';

  @column({ isPrimary: true, serializeAs: null })
  public id: number

  @column()
  public key: string

  @column()
  public value: string | null

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime
}
