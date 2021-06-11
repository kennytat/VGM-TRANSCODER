import 'reflect-metadata'
import { ObjectType, Field, Int } from '@nestjs/graphql'
import { Topic } from './topic.model'

@ObjectType()
export class Content {
  @Field((type) => String)
  id: string

  @Field((type) => [Topic])
  topic: [Topic]

  @Field((type) => Int)
  dblevel: number

  @Field((type) => String)
  pid: string

  @Field((type) => String)
  name: string

  @Field((type) => Date)
  createdAt: Date
  
  @Field((type) => Date)
  updatedAt: Date
  
  @Field((type) => String, { nullable: true })
  qm?: string | null
  
  @Field((type) => Int, { nullable: true })
  duration?: string | null

  @Field((type) => Int, { nullable: true })
  size?: string | null
  
  @Field((type) => String)
  thumb: string
  
  @Field((type) => String)
  filetype: string
}
