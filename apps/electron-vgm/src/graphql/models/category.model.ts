import 'reflect-metadata'
import { ObjectType, Field } from '@nestjs/graphql'
import { Media } from './media.model'
import { Classification } from './classification.model'

@ObjectType()
export class Category {
  @Field((type) => String)
  id: string

  @Field((type) => Media)
  parent: Media

  @Field((type) => String)
  pid: string

  @Field((type) => String)
  name: string

  @Field((type) => String, { nullable: true })
  qm?: string | null
 
  @Field((type) => [Classification], {nullable: true})
  classes?: [Classification]
}
 