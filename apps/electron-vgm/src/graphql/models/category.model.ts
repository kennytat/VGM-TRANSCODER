import 'reflect-metadata'
import { ObjectType, Field, Int } from '@nestjs/graphql'
import { Media } from './media.model'
import { Classification } from './classification.model'

@ObjectType()
export class Category {
  @Field((type) => String)
  id: string

  @Field((type) => [Media])
  media: [Media]

  @Field((type) => Int)
  dblevel: number

  @Field((type) => String)
  pid: string

  @Field((type) => String)
  name: string

  @Field((type) => String, { nullable: true })
  origin: string | null

  @Field((type) => String, { nullable: true })
  folder: string | null

  @Field((type) => String, { nullable: true })
  qm?: string | null

  @Field((type) => String)
  foldertype: string

  @Field((type) => [Classification], { nullable: true })
  classes?: [Classification] | null
}
