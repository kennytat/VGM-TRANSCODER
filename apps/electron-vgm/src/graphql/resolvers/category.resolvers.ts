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
import { Category } from '../models/category.model'
import { Classification } from '../models/classification.model'
import { PrismaService } from '../prisma.service'
// import { ClassificationCreateInput } from './classification.resolvers'
// import { ClassificationResolver } from './classification.resolvers'


// @InputType()
// class CategoryUniqueInput {
//   @Field({ nullable: true })
//   id: string

//   @Field({ nullable: true })
//   name: string
// }

// @InputType()
// class CategoryCreateInput {
//   @Field()
//   name: string

//   @Field({ nullable: true })
//   qm: string

//   @Field({ nullable: true })
//   qm: string

//   @Field({ nullable: true })
//   duration: number

//   @Field({ nullable: true })
//   size: number

//   @Field()
//   thumb: string

//   @Field()
//   isvideo: boolean
// }

@Resolver(Category)
export class CategoryResolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) { }

    @ResolveField('classes', () => [Classification])
  async getClasses(@Root() categories: Category) {
    return this.prismaService.classification.findMany({
      where: {
        pid: categories.id
      } 
    });
  }

  @Query(() => Category, { name: 'categories' })
  async getCategories(@Args('id', { type: () => String }) id: string) {
    return this.prismaService.category.findMany(
      {
        where: {
          id: id
        }
      }
      );
  }

  // @ResolveField('classification', returns => [Classfication])
  // async categories(@Root() media: Media) {
  //   const { id } = media;
  //   return this.prismaService.media.findUnique({
  //     where: {
  //       id: id
  //     }
  //   });
  // }


  // @ResolveField()
  // async posts(@Root() content: Content, @Context() ctx): Promise<Post[]> {
  //   return this.prismaService.user
  //     .findUnique({
  //       where: {
  //         id: user.id,
  //       },
  //     })
  //     .posts()
  // }

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

  // @Query((returns) => User, { nullable: true })
  // async allUsers(@Context() ctx) {
  //   return this.prismaService.user.findMany()
  // }

  // @Query((returns) => [Post], { nullable: true })
  // async draftsByUser(@Args('userUniqueInput') userUniqueInput: UserUniqueInput): Promise<Post[]> {
  //   return this.prismaService.user.findUnique({
  //     where: {
  //       id: userUniqueInput.id || undefined,
  //       email: userUniqueInput.email || undefined
  //     }
  //   }).posts({
  //     where: {
  //       published: false
  //     }
  //   })
  // }
}
