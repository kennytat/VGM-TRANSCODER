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


import { Level1 } from '../models/level1.model'
import { Level2 } from '../models/level2.model'
import { Level3 } from '../models/level3.model'

@Resolver(Level2)
export class Level2Resolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) { }

  @Query(() => Level2, { name: 'level2Unique' })
  async getSelf(@Args('id', { type: () => String }) id: string) {
    return this.prismaService.level2.findUnique({
      where: {
        id: id
      }
    });
  }

  @ResolveField('parent', () => [Level1])
  async getParent(@Root() level2: Level2) {
    return this.prismaService.level1.findUnique({
      where: {
        id: level2.pid,
      },
    })
  }

  @ResolveField('children', () => [Level3])
  async getChildren(@Root() level2: Level2) {
    return this.prismaService.level3.findMany({
      where: {
        pid: level2.id
      }
    });
  }

  @Query((returns) => [Level2])
  level2Queries(
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
    return this.prismaService.level2.findMany({
      where: {
        ...or,
      },
    })
  }







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
