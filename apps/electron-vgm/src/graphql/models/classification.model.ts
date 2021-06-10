import 'reflect-metadata'
import { ObjectType, Field, Int } from '@nestjs/graphql'
import { Category } from './category.model'
import { Topic } from './topic.model'

@ObjectType()
export class Classification {
  @Field((type) => String)
  id: string

  @Field((type) => [Category])
  parent: Category

  @Field((type) => Int)
  dblevel: number

  @Field((type) => String)
  pid: string

  @Field((type) => String)
  name: string

  @Field((type) => String, { nullable: true })
  qm?: string | null
 
  @Field((type) => [Topic], {nullable: true })
  topics?: [Topic] | null
  
}