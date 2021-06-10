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
import { Media } from '../models/media.model'
import { Category } from '../models/category.model'
// import { CategoryCreateInput } from './content.resolvers'
import { PrismaService } from '../prisma.service'

@InputType()
class MediaUniqueInput {
  @Field({ nullable: true })
  id: string

  @Field({ nullable: true })
  name: string
}

// @InputType()
// class MediaCreateInput {
//   @Field()
//   name: string

//   @Field({ nullable: true })
//   qm: string

//   @Field((type) => [CategoryCreateInput])
//   categories: [CategoryCreateInput]
// }

@Resolver(Media)
export class MediaResolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) { }

  @ResolveField('categories', () => [Category])
  async getCategories(@Root() media: Media) {
    return this.prismaService.category.findMany({
      where: {
        pid: media.id
      } 
    });
  }

  @Query(() => Media, { name: 'media' })
  async getMedia(@Args('id', { type: () => String }) id: string) {
    return this.prismaService.media.findUnique(
      {
        where: {
          id: id
        }
      }
      );
  }
}

  // @Mutation((returns) => User)
  // async signupUser(
  //   @Args('data') data: UserCreateInput,
  //   @Context() ctx,
  // ): Promise<User> {
  //   const postData = data.posts?.map((post) => {
  //     return { title: post.title, content: post.content || undefined }
  //   })

  //   return this.prismaService.user.create({
  //     data: {
  //       email: data.email,
  //       name: data.name,
  //       posts: {
  //         create: postData
  //       }
  //     },
  //   })
  // }

//   @Query((returns) => Media, { nullable: true })
//   async allMedias(@Context() ctx) {
//     return this.prismaService.media.findMany(

//     )
//   }

//   @Query((returns) => [Category], { nullable: true })
//   async searchByMedia(@Args('mediaUniqueInput') mediaUniqueInput: MediaUniqueInput): Promise<Category[]> {
//     return this.prismaService.media.findUnique({
//       where: {
//         id: mediaUniqueInput.id || undefined,
//         name: mediaUniqueInput.name || undefined
//       }
//     }).categories()
//   }
// }

// @InputType()
// class UserUniqueInput {
//   @Field({ nullable: true })
//   id: number

//   @Field({ nullable: true })
//   email: string
// }

// @InputType()
// class UserCreateInput {
//   @Field()
//   email: string

//   @Field({ nullable: true })
//   name: string

//   @Field((type) => [PostCreateInput], { nullable: true })
//   posts: [PostCreateInput]
// }

// @Resolver(User)
// export class UserResolver {
//   constructor(@Inject(PrismaService) private prismaService: PrismaService) { }

//   @ResolveField()
//   async posts(@Root() user: User, @Context() ctx): Promise<Post[]> {
//     return this.prismaService.user
//       .findUnique({
//         where: {
//           id: user.id,
//         },
//       })
//       .posts()
//   }

//   @Mutation((returns) => User)
//   async signupUser(
//     @Args('data') data: UserCreateInput,
//     @Context() ctx,
//   ): Promise<User> {
//     const postData = data.posts?.map((post) => {
//       return { title: post.title, content: post.content || undefined }
//     })

//     return this.prismaService.user.create({
//       data: {
//         email: data.email,
//         name: data.name,
//         posts: {
//           create: postData
//         }
//       },
//     })
//   }

//   @Query((returns) => User, { nullable: true })
//   async allUsers(@Context() ctx) {
//     return this.prismaService.user.findMany()
//   }

//   @Query((returns) => [Post], { nullable: true })
//   async draftsByUser(@Args('userUniqueInput') userUniqueInput: UserUniqueInput): Promise<Post[]> {
//     return this.prismaService.user.findUnique({
//       where: {
//         id: userUniqueInput.id || undefined,
//         email: userUniqueInput.email || undefined
//       }
//     }).posts({
//       where: {
//         published: false
//       }
//     })
//   }
// }

