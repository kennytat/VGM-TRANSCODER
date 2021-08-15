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
import { PrismaService } from '../prisma.service'
import { Inject } from '@nestjs/common'

import { Level6 } from '../models/level6.model'
import { Level7 } from '../models/level7.model'



// @InputType()
// export class ContentCreateInput {

//   @Field((type) => String)
//   pid: string

//   @Field((type) => String)
//   name: string

//   @Field((type) => String, { nullable: true })
//   qm?: string | null

//   @Field((type) => String)
//   duration: string

//   @Field((type) => String)
//   size: string

//   @Field((type) => String, { nullable: true })
//   origin: string | null

//   @Field((type) => String, { nullable: true })
//   folder: string | null

//   @Field((type) => String, { nullable: true})
//   verse: string | null

//   @Field((type) => String)
//   thumb: string

//   @Field((type) => String)
//   filetype: string
// }

// @InputType()
// class PostOrderByUpdatedAtInput {
//   @Field((type) => SortOrder)
//   updatedAt: SortOrder
// }

// enum SortOrder {
//   asc = 'asc',
//   desc = 'desc'
// }

// registerEnumType(SortOrder, {
//   name: 'SortOrder'
// })



@Resolver(Level7)
export class Level7Resolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) { }

  @Query(() => Level7, { name: 'level7Unique' })
  async getSelf(@Args('id', { type: () => String }) id: string) {
    return this.prismaService.level7.findUnique({
      where: {
        id: id
      }
    });
  }

  @ResolveField('parent', () => [Level6])
  async getParent(@Root() level7: Level7) {
    return this.prismaService.level6.findUnique({
      where: {
        id: level7.pid,
      },
    })
  }

  @Query((returns) => [Level7])
  level7Queries(
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
    return this.prismaService.level7.findMany({
      where: {
        ...or,
      },
    })
  }

  // @ResolveField('children', () => [Level8])
  // async getChildren(@Root() level7: Level7) {
  //   return this.prismaService.level8.findMany({
  //     where: {
  //       pid: level7.id
  //     }
  //   });
  // }




  //   @ResolveField('topic', () => [Topic])
  //   async getParent(@Root() content: Content){
  //     return this.prismaService.topic
  //       .findMany({
  //         where: {
  //           id: content.pid,
  //         },
  //       })
  //   }


  //   // @Query((returns) => Post, { nullable: true })
  //   // postById(@Args('id') id: number) {
  //   //   return this.prismaService.post.findUnique({
  //   //     where: { id },
  //   //   })
  //   // }

  //   @Query((returns) => [Content])
  //   video(
  //     @Args('searchVideo', { nullable: true }) searchVideo: string,
  //     @Args('skip', { nullable: true }) skip: number,
  //     @Args('take', { nullable: true }) take: number,
  //     @Args('orderBy', { nullable: true }) orderBy: PostOrderByUpdatedAtInput,
  //     @Context() ctx) {

  //     const or = searchVideo
  //       ? {
  //         OR: [
  //           { name: { contains: searchVideo } }
  //         ],
  //       }
  //       : {}

  //     return this.prismaService.content.findMany({
  //       where: {
  //          filetype: { contains: 'video' },
  //         ...or,
  //       },
  //       take: take || undefined,
  //       skip: skip || undefined,
  //       orderBy: orderBy || undefined,
  //     })
  //   }


  //   @Query((returns) => [Content])
  //   audio(
  //     @Args('searchAudio', { nullable: true }) searchAudio: string,
  //     @Args('skip', { nullable: true }) skip: number,
  //     @Args('take', { nullable: true }) take: number,
  //     @Args('orderBy', { nullable: true }) orderBy: PostOrderByUpdatedAtInput,
  //     @Context() ctx) {

  //     const or = searchAudio
  //       ? {
  //         OR: [
  //           { name: { contains: searchAudio } }
  //         ],
  //       }
  //       : {}

  //     return this.prismaService.content.findMany({
  //       where: {
  //         filetype: { contains: 'audio' } ,
  //         ...or,
  //       },
  //       take: take || undefined,
  //       skip: skip || undefined,
  //       orderBy: orderBy || undefined,
  //     })
  //   }

  //   @Mutation((returns) => Content)
  //   createContent(
  //     @Args('data') data: ContentCreateInput,
  //     @Context() ctx,
  //   ) {
  //     return this.prismaService.content.create({
  //       data: {
  //         name: data.name,
  //         qm: data.qm,
  //         duration: data.duration,
  //         size: data.size,
  //         origin: data.origin,
  //         folder: data.folder,
  //         verse: data.verse,
  //         thumb:data.thumb,
  //         filetype: data.filetype,
  //         topics: {
  //           connect: {
  //             id: data.pid
  //           }
  //         }
  //       },
  //     })
  //   }


  //     @Mutation((returns) => Content, { nullable: true })
  //     async deleteContent(
  //       @Args('id') id: string,
  //       @Context() ctx,
  //     ) {
  //       return this.prismaService.content.delete({
  //         where: {
  //           id: id,
  //         },
  //       })
  //     }

  //   // @Mutation(returns => Post)
  //   // incrementPostViewCount(
  //   //   @Args('id') id: number
  //   // ): Promise<Post> {
  //   //   return this.prismaService.post.update({
  //   //     where: { id },
  //   //     data: {
  //   //       viewCount: {
  //   //         increment: 1
  //   //       }
  //   //     }
  //   //   })
  //   // }

  //   // @Mutation((returns) => Post, { nullable: true })
  //   // async togglePublishPost(@Args('id') id: number): Promise<Post | null> {
  //   //   const post = await this.prismaService.post.findUnique({
  //   //     where: { id: id || undefined },
  //   //     select: {
  //   //       published: true,
  //   //     },
  //   //   })

  //   //   return this.prismaService.post.update({
  //   //     where: { id: id || undefined },
  //   //     data: { published: !post?.published },
  //   //   })
  //   // }

  //   // @Mutation((returns) => Post, { nullable: true })
  //   // async deletePost(
  //   //   @Args('id') id: number,
  //   //   @Context() ctx,
  //   // ): Promise<Post | null> {
  //   //   return this.prismaService.post.delete({
  //   //     where: {
  //   //       id: id,
  //   //     },
  //   //   })
  //   // }
  // }


  // // @Resolver(Post)
  // // export class CategoryResolver {
  // //   constructor(@Inject(PrismaService) private prismaService: PrismaService) { }

  // //   @ResolveField()
  // //   author(@Root() post: Post): Promise<User | null> {
  // //     return this.prismaService.post
  // //       .findUnique({
  // //         where: {
  // //           id: post.id,
  // //         },
  // //       })
  // //       .author()
  // //   }

  // //   @Query((returns) => Post, { nullable: true })
  // //   postById(@Args('id') id: number) {
  // //     return this.prismaService.post.findUnique({
  // //       where: { id },
  // //     })
  // //   }

  // //   @Query((returns) => [Post])
  // //   feed(
  // //     @Args('searchString', { nullable: true }) searchString: string,
  // //     @Args('skip', { nullable: true }) skip: number,
  // //     @Args('take', { nullable: true }) take: number,
  // //     @Args('orderBy', { nullable: true }) orderBy: PostOrderByUpdatedAtInput,
  // //     @Context() ctx) {

  // //     const or = searchString
  // //       ? {
  // //         OR: [
  // //           { title: { contains: searchString } },
  // //           { content: { contains: searchString } },
  // //         ],
  // //       }
  // //       : {}

  // //     return this.prismaService.post.findMany({
  // //       where: {
  // //         published: true,
  // //         ...or,
  // //       },
  // //       take: take || undefined,
  // //       skip: skip || undefined,
  // //       orderBy: orderBy || undefined,
  // //     })
  // //   }

  // //   @Mutation((returns) => Post)
  // //   createDraft(
  // //     @Args('data') data: PostCreateInput,
  // //     @Args('authorEmail') authorEmail: string,
  // //     @Context() ctx,
  // //   ): Promise<Post> {
  // //     return this.prismaService.post.create({
  // //       data: {
  // //         title: data.title,
  // //         content: data.content,
  // //         author: {
  // //           connect: { email: authorEmail },
  // //         },
  // //       },
  // //     })
  // //   }

  // //   @Mutation(returns => Post)
  // //   incrementPostViewCount(
  // //     @Args('id') id: number
  // //   ): Promise<Post> {
  // //     return this.prismaService.post.update({
  // //       where: { id },
  // //       data: {
  // //         viewCount: {
  // //           increment: 1
  // //         }
  // //       }
  // //     })
  // //   }

  // //   @Mutation((returns) => Post, { nullable: true })
  // //   async togglePublishPost(@Args('id') id: number): Promise<Post | null> {
  // //     const post = await this.prismaService.post.findUnique({
  // //       where: { id: id || undefined },
  // //       select: {
  // //         published: true,
  // //       },
  // //     })

  // //     return this.prismaService.post.update({
  // //       where: { id: id || undefined },
  // //       data: { published: !post?.published },
  // //     })
  // //   }

  // //   @Mutation((returns) => Post, { nullable: true })
  // //   async deletePost(
  // //     @Args('id') id: number,
  // //     @Context() ctx,
  // //   ): Promise<Post | null> {
  // //     return this.prismaService.post.delete({
  // //       where: {
  // //         id: id,
  // //       },
  // //     })
  // //   }
}
