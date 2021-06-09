import 'reflect-metadata'
import { ObjectType, Field, Int } from '@nestjs/graphql'
import { Topic } from './topic.model'

@ObjectType()
export class Content {
  @Field((type) => String)
  id: string

  @Field((type) => [Topic])
  parent: Topic

  @Field((type) => String)
  pid: string

  @Field((type) => String)
  name: string

  @Field((type) => String, { nullable: true })
  qm: string | null
  
  @Field((type) => Int, { nullable: true })
  duration: string | null

  @Field((type) => Int, { nullable: true })
  size: string | null
  
  @Field((type) => String)
  thumb: string
  
  @Field((type) => Boolean)
  isvideo: Boolean
}
