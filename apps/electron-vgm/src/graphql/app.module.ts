import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { PrismaService } from './prisma.service'

import { MediaResolver } from './resolvers/media.resolvers'
import { CategoryResolver } from './resolvers/category.resolvers'
import { ClassificationResolver } from './resolvers/classification.resolvers'
import { TopicResolver } from './resolvers/topic.resolvers'
import { ContentResolver } from './resolvers/content.resolvers'

import { join } from 'path'

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'apps/electron-vgm/src/graphql/schema.gql')
   
    })
  ],
  controllers: [],
  providers: [
    PrismaService, 
    MediaResolver, 
    CategoryResolver,
    ClassificationResolver,
    TopicResolver,
    ContentResolver
  ],
})
export class AppModule { }
