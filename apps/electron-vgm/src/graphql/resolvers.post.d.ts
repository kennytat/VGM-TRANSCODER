import 'reflect-metadata';
import { Post } from './post';
import { User } from './user';
import { PrismaService } from './prisma.service';
export declare class PostCreateInput {
    title: string;
    content: string;
}
declare class PostOrderByUpdatedAtInput {
    updatedAt: SortOrder;
}
declare enum SortOrder {
    asc = "asc",
    desc = "desc"
}
export declare class PostResolver {
    private prismaService;
    constructor(prismaService: PrismaService);
    author(post: Post): Promise<User | null>;
    postById(id: number): import(".prisma/client").Prisma.Prisma__PostClient<import(".prisma/client").Post>;
    feed(searchString: string, skip: number, take: number, orderBy: PostOrderByUpdatedAtInput, ctx: any): import(".prisma/client").PrismaPromise<import(".prisma/client").Post[]>;
    createDraft(data: PostCreateInput, authorEmail: string, ctx: any): Promise<Post>;
    incrementPostViewCount(id: number): Promise<Post>;
    togglePublishPost(id: number): Promise<Post | null>;
    deletePost(id: number, ctx: any): Promise<Post | null>;
}
export {};
