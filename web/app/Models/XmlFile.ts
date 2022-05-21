import { DateTime } from 'luxon'
import { BaseModel, column, computed } from '@ioc:Adonis/Lucid/Orm'

export default class XmlFile extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public filename: string

  @column()
  public filepath: string

  @column({ columnName: 'original_filename' })
  public originalFilename: string | undefined

  @column()
  public description: string

  @computed()
  public get uploadedAt()
  {
    return this.createdAt.setLocale('no').toFormat('f')
  }


  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime
}
