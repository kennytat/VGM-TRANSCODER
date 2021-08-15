import 'reflect-metadata'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  ResolveField,
  Root,
  InputType,
  Field,
} from '@nestjs/graphql'
import { Inject } from '@nestjs/common'
import { PrismaService } from '../prisma.service'


import { Level5 } from '../models/level5.model'
import { Level6 } from '../models/level6.model'
import { Level7 } from '../models/level7.model'

@Resolver(Level6)
export class Level6Resolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) { }

  @Query(() => Level6, { name: 'level6Unique' })
  async getSelf(@Args('id', { type: () => String }) id: string) {
    return this.prismaService.level6.findUnique({
      where: {
        id: id
      }
    });
  }

  @ResolveField('parent', () => [Level5])
  async getParent(@Root() level6: Level6) {
    return this.prismaService.level5.findUnique({
      where: {
        id: level6.pid,
      },
    })
  }

  @ResolveField('children', () => [Level7])
  async getChildren(@Root() level6: Level6) {
    return this.prismaService.level7.findMany({
      where: {
        pid: level6.id
      }
    });
  }

  @Query((returns) => [Level6])
  level6Queries(
    @Args('isVideo') isVideo: boolean,
    @Args('isLeaf', { nullable: true }) isLeaf: boolean,
    @Args('id', { nullable: true }) id: string,
    @Context() ctx) {
    const or = isVideo
      ? {
        OR: [{
          isVideo: isVideo,
          isLeaf: isLeaf,
          id: id
        }],
      } : {}
    return this.prismaService.level6.findMany({
      where: {
        ...or,
      },
    })
  }
  //   @ResolveField('contents', () => [Content])
  //   async getTopic(@Root() topics: Topic) {
  //     return this.prismaService.content.findMany({
  //       where: {
  //         pid: topics.id
  //       }
  //     });
  //   }

  //   @ResolveField('classes', () => [Classification])
  //   async getParent(@Root() topic: Topic) {
  //     return this.prismaService.classification
  //     .findMany({
  //       where: {
  //         id: topic.pid,
  //       },
  //     })
  //   }


  //   @Query(() => Topic, { name: 'topics' })
  //   async getTopics(@Args('id', { type: () => String }) id: string) {
  //     return this.prismaService.topic.findMany(
  //       {
  //         where: {
  //           id: id
  //         }
  //       }
  //       );
  //     }

  //     @Query((returns) => [Topic])
  //     getVideoTopics(
  //       @Args('searchVideoTopics', { nullable: true }) searchVideoTopics: string,
  //       @Args('skip', { nullable: true }) skip: number,
  //       @Args('take', { nullable: true }) take: number,
  //       @Context() ctx) {

  //         const or = searchVideoTopics
  //         ? {
  //           OR: [
  //             { name: { contains: searchVideoTopics } }
  //           ],
  //         }
  //         : {}

  //         return this.prismaService.topic.findMany({
  //           where: {
  //             foldertype: { contains: 'video' },
  //             ...or,
  //           },
  //       take: take || undefined,
  //       skip: skip || undefined,
  //     })
  //   }



















  //   // import { PostCreateInput } from './resolvers.post'

  //   // @InputType()
  //   // class UserUniqueInput {
  //   //   @Field({ nullable: true })
  //   //   id: number

  //   //   @Field({ nullable: true })
  //   //   email: string
  //   // }

  //   // @InputType()
  //   // class UserCreateInput {
  //   //   @Field()
  //   //   email: string

  //   //   @Field({ nullable: true })
  //   //   name: string

  //   //   @Field((type) => [PostCreateInput], { nullable: true })
  //   //   posts: [PostCreateInput]
  //   // }


  //   // @ResolveField()
  //   // async posts(@Root() user: User, @Context() ctx): Promise<Post[]> {
  //   //   return this.prismaService.user
  //   //     .findUnique({
  //   //       where: {
  //   //         id: user.id,
  //   //       },
  //   //     })
  //   //     .posts()
  //   // }

  //   // @Mutation((returns) => User)
  //   // async signupUser(
  //   //   @Args('data') data: UserCreateInput,
  //   //   @Context() ctx,
  //   // ): Promise<User> {
  //   //   const postData = data.posts?.map((post) => {
  //   //     return { title: post.title, content: post.content || undefined }
  //   //   })

  //   //   return this.prismaService.user.create({
  //   //     data: {
  //   //       email: data.email,
  //   //       name: data.name,
  //   //       posts: {
  //   //         create: postData
  //   //       }
  //   //     },
  //   //   })
  //   // }

  //   // @Query((returns) => User, { nullable: true })
  //   // async allUsers(@Context() ctx) {
  //   //   return this.prismaService.user.findMany()
  //   // }

  //   // @Query((returns) => [Post], { nullable: true })
  //   // async draftsByUser(@Args('userUniqueInput') userUniqueInput: UserUniqueInput): Promise<Post[]> {
  //   //   return this.prismaService.user.findUnique({
  //   //     where: {
  //   //       id: userUniqueInput.id || undefined,
  //   //       email: userUniqueInput.email || undefined
  //   //     }
  //   //   }).posts({
  //   //     where: {
  //   //       published: false
  //   //     }
  //   //   })
  //   // }
}
