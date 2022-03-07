import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasOne, hasOne, scope } from '@ioc:Adonis/Lucid/Orm'
import XmlFile from './XmlFile'

export default class Job extends BaseModel {

  @column({ isPrimary: true })
  public id: number

  @column()
  public memory: number

  @column({ columnName: 'xml_file_id' })
  public xmlFileId: string

  @belongsTo(() => XmlFile, {serializeAs: 'xmlConfig'})
  public xmlConfig: BelongsTo<typeof XmlFile>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public static ignoreCompleted = scope((query) => {
    query.whereNot('status', 'completed')
  })

  

  // @beforeFind()
  // public static ignoreCompleted (query: ModelQueryBuilderContract<typeof Job>) {
  //   query.whereNull('completed_at') 
  // }
}
