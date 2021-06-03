import 'reflect-metadata';
import { Post } from './post';
export declare class User {
    id: number;
    email: string;
    name?: string | null;
    posts?: [Post] | null;
}
