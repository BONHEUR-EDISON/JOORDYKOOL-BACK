import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  async getPosts() {
    return this.postsService.getAll();
  }

  @Post()
  async createPost(@Body() body: { userId: string; content: string }) {
    return this.postsService.create(body.userId, body.content);
  }

  @Post(':id/like')
  async likePost(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.postsService.likePost(id, body.userId);
  }

  @Post(':id/comment')
  async addComment(
    @Param('id') id: string,
    @Body() body: { userId: string; content: string },
  ) {
    return this.postsService.addComment(id, body.userId, body.content);
  }
}
