import 'reflect-metadata'
import { ObjectType, Field, Int } from '@nestjs/graphql'
import { Classification } from './classification.model'
import { Content } from './content.model'

@ObjectType()
export class Topic {
  @Field((type) => String)
  id: string

  @Field((type) => Int)
  dblevel: number
  
  @Field((type) => [Classification])
  parent: Classification

  @Field((type) => String)
  pid: string

  @Field((type) => String)
  name: string

  @Field((type) => String, { nullable: true })
  qm?: string | null
 
  @Field((type) => [Content], {nullable: true} )
  contents?: [Content]
  
}