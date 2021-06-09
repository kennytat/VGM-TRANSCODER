import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { PrismaService } from './prisma.service'

import { MediaResolver } from './media.resolvers'
import { CategoryResolver } from './category.resolvers'
import { ClassificationResolver } from './classification.resolvers'
import { TopicResolver } from './topic.resolvers'
import { ContentResolver } from './content.resolvers'

import { join } from 'path'

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'apps/electron-vgm/src/graphql/schema.gql'),
      buildSchemaOptions: { dateScalarMode: 'timestamp' }
   
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
