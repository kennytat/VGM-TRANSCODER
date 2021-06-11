import 'reflect-metadata'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Root,
  Context,
  Int,
  InputType,
  Field,
  registerEnumType,
} from '@nestjs/graphql'
import { Inject } from '@nestjs/common'
import { Content } from '../models/content.model'
import { Topic } from '../models/topic.model'
import { PrismaService } from '../prisma.service'

// @InputType()
// export class ContentCreateInput {
//   @Field()
//   name: string

//   @Field({ nullable: true })
//   qm: string

// }

@InputType()
class PostOrderByUpdatedAtInput {
  @Field((type) => SortOrder)
  updatedAt: SortOrder
}

enum SortOrder {
  asc = 'asc',
  desc = 'desc'
}

registerEnumType(SortOrder, {
  name: 'SortOrder'
})



@Resolver(Content)
export class ContentResolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) { }

  @ResolveField('topic', () => [Topic])
  async getParent(@Root() content: Content){
    return this.prismaService.topic
      .findMany({
        where: {
          id: content.pid,
        },
      })
  }


  // @Query((returns) => Post, { nullable: true })
  // postById(@Args('id') id: number) {
  //   return this.prismaService.post.findUnique({
  //     where: { id },
  //   })
  // }

  @Query((returns) => [Content])
  video(
    @Args('searchVideo', { nullable: true }) searchVideo: string,
    @Args('skip', { nullable: true }) skip: number,
    @Args('take', { nullable: true }) take: number,
    @Args('orderBy', { nullable: true }) orderBy: PostOrderByUpdatedAtInput,
    @Context() ctx) {

    const or = searchVideo
      ? {
        OR: [
          { name: { contains: searchVideo } }
        ],
      }
      : {}

    return this.prismaService.content.findMany({
      where: {
         filetype: { contains: 'video' },
        ...or,
      },
      take: take || undefined,
      skip: skip || undefined,
      orderBy: orderBy || undefined,
    })
  }


  @Query((returns) => [Content])
  audio(
    @Args('searchAudio', { nullable: true }) searchAudio: string,
    @Args('skip', { nullable: true }) skip: number,
    @Args('take', { nullable: true }) take: number,
    @Args('orderBy', { nullable: true }) orderBy: PostOrderByUpdatedAtInput,
    @Context() ctx) {

    const or = searchAudio
      ? {
        OR: [
          { name: { contains: searchAudio } }
        ],
      }
      : {}

    return this.prismaService.content.findMany({
      where: {
        filetype: { contains: 'audio' } ,
        ...or,
      },
      take: take || undefined,
      skip: skip || undefined,
      orderBy: orderBy || undefined,
    })
  }
  // @Mutation((returns) => Post)
  // createDraft(
  //   @Args('data') data: PostCreateInput,
  //   @Args('authorEmail') authorEmail: string,
  //   @Context() ctx,
  // ): Promise<Post> {
  //   return this.prismaService.post.create({
  //     data: {
  //       title: data.title,
  //       content: data.content,
  //       author: {
  //         connect: { email: authorEmail },
  //       },
  //     },
  //   })
  // }

  // @Mutation(returns => Post)
  // incrementPostViewCount(
  //   @Args('id') id: number
  // ): Promise<Post> {
  //   return this.prismaService.post.update({
  //     where: { id },
  //     data: {
  //       viewCount: {
  //         increment: 1
  //       }
  //     }
  //   })
  // }

  // @Mutation((returns) => Post, { nullable: true })
  // async togglePublishPost(@Args('id') id: number): Promise<Post | null> {
  //   const post = await this.prismaService.post.findUnique({
  //     where: { id: id || undefined },
  //     select: {
  //       published: true,
  //     },
  //   })

  //   return this.prismaService.post.update({
  //     where: { id: id || undefined },
  //     data: { published: !post?.published },
  //   })
  // }

  // @Mutation((returns) => Post, { nullable: true })
  // async deletePost(
  //   @Args('id') id: number,
  //   @Context() ctx,
  // ): Promise<Post | null> {
  //   return this.prismaService.post.delete({
  //     where: {
  //       id: id,
  //     },
  //   })
  // }
}


// @Resolver(Post)
// export class CategoryResolver {
//   constructor(@Inject(PrismaService) private prismaService: PrismaService) { }

//   @ResolveField()
//   author(@Root() post: Post): Promise<User | null> {
//     return this.prismaService.post
//       .findUnique({
//         where: {
//           id: post.id,
//         },
//       })
//       .author()
//   }

//   @Query((returns) => Post, { nullable: true })
//   postById(@Args('id') id: number) {
//     return this.prismaService.post.findUnique({
//       where: { id },
//     })
//   }

//   @Query((returns) => [Post])
//   feed(
//     @Args('searchString', { nullable: true }) searchString: string,
//     @Args('skip', { nullable: true }) skip: number,
//     @Args('take', { nullable: true }) take: number,
//     @Args('orderBy', { nullable: true }) orderBy: PostOrderByUpdatedAtInput,
//     @Context() ctx) {

//     const or = searchString
//       ? {
//         OR: [
//           { title: { contains: searchString } },
//           { content: { contains: searchString } },
//         ],
//       }
//       : {}

//     return this.prismaService.post.findMany({
//       where: {
//         published: true,
//         ...or,
//       },
//       take: take || undefined,
//       skip: skip || undefined,
//       orderBy: orderBy || undefined,
//     })
//   }

//   @Mutation((returns) => Post)
//   createDraft(
//     @Args('data') data: PostCreateInput,
//     @Args('authorEmail') authorEmail: string,
//     @Context() ctx,
//   ): Promise<Post> {
//     return this.prismaService.post.create({
//       data: {
//         title: data.title,
//         content: data.content,
//         author: {
//           connect: { email: authorEmail },
//         },
//       },
//     })
//   }

//   @Mutation(returns => Post)
//   incrementPostViewCount(
//     @Args('id') id: number
//   ): Promise<Post> {
//     return this.prismaService.post.update({
//       where: { id },
//       data: {
//         viewCount: {
//           increment: 1
//         }
//       }
//     })
//   }

//   @Mutation((returns) => Post, { nullable: true })
//   async togglePublishPost(@Args('id') id: number): Promise<Post | null> {
//     const post = await this.prismaService.post.findUnique({
//       where: { id: id || undefined },
//       select: {
//         published: true,
//       },
//     })

//     return this.prismaService.post.update({
//       where: { id: id || undefined },
//       data: { published: !post?.published },
//     })
//   }

//   @Mutation((returns) => Post, { nullable: true })
//   async deletePost(
//     @Args('id') id: number,
//     @Context() ctx,
//   ): Promise<Post | null> {
//     return this.prismaService.post.delete({
//       where: {
//         id: id,
//       },
//     })
//   }
// }
