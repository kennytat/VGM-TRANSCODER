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

  @Field((type) => String)
  duration: string

  @Field((type) => String)
  size: string

  @Field((type) => String, { nullable: true })
  origin: string | null

  @Field((type) => String, { nullable: true })
  folder: string | null

  @Field((type) => String, { nullable: true })
  verse: string | null

  @Field((type) => String, {nullable: true})
  thumb: string | null

  @Field((type) => String)
  filetype: string
}
