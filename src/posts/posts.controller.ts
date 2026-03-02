// src/posts/posts.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  async getPosts() {
    return this.postsService.getAll();
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postsService.getById(id);
  }

  @Get('feed')
  async getFeed(@Req() req) {
    return this.postsService.getFeed(req.user.id);
  }

  @Post()
  async createPost(@Body() dto: CreatePostDto, @Req() req) {
    return this.postsService.create(req.user.id, dto);
  }

  @Post(':id/like')
  async likePost(@Param('id') id: string, @Req() req) {
    return this.postsService.likePost(id, req.user.id);
  }

  @Post(':id/comment')
  async addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @Req() req,
  ) {
    return this.postsService.addComment(id, req.user.id, content);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string, @Req() req) {
    return this.postsService.deletePost(id, req.user.id);
  }
}
