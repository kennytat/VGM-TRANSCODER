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
import { Classification } from '../models/classification.model'
import { Topic } from '../models/topic.model'
import { PrismaService } from '../prisma.service'
// import { PostCreateInput } from './resolvers.post'

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

@Resolver(Classification)
export class ClassificationResolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) { }

  @ResolveField('topics', () => [Topic])
  async getTopics(@Root() classes: Classification) {
    return this.prismaService.topic.findMany({
      where: {
        pid: classes.id
      }
    });
  }

  @Query(() => Classification, { name: 'classes' })
  async getClasses(@Args('id', { type: () => String }) id: string) {
    return this.prismaService.classification.findMany(
      {
        where: {
          id: id
        }
      }
    );
  }


  // @ResolveField()
  // async posts(@Root() user: User, @Context() ctx): Promise<Post[]> {
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
