import 'reflect-metadata';
import { Post } from './post';
import { User } from './user';
import { PrismaService } from './prisma.service';
import { PostCreateInput } from './resolvers.post';
declare class UserUniqueInput {
    id: number;
    email: string;
}
declare class UserCreateInput {
    email: string;
    name: string;
    posts: [PostCreateInput];
}
export declare class UserResolver {
    private prismaService;
    constructor(prismaService: PrismaService);
    posts(user: User, ctx: any): Promise<Post[]>;
    signupUser(data: UserCreateInput, ctx: any): Promise<User>;
    allUsers(ctx: any): Promise<import(".prisma/client").User[]>;
    draftsByUser(userUniqueInput: UserUniqueInput): Promise<Post[]>;
}
export {};
