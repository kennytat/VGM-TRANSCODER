import 'reflect-metadata'
import { ObjectType, Field, Int } from '@nestjs/graphql'
import { Category } from './category.model'

@ObjectType()
export class Media {
  @Field((type) => String)
  id: string

  @Field((type) => Int)
  dblevel: number

  @Field((type) => String)
  pid: string

  @Field((type) => String)
  name: string

  @Field((type) => String, {nullable: true})
  qm?: string | null

  @Field((type) => [Category], {nullable: true})
  categories?: [Category] | null
}

