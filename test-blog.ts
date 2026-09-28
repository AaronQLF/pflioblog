import { getAllPosts } from './src/lib/blog.ts';
console.log(getAllPosts().map(p => p.title));
