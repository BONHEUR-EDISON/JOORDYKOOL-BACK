// src/stories/stories.controller.ts
import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateStoryDto } from './dto/create-story.dto';

@UseGuards(JwtAuthGuard)
@Controller('stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @Get()
  getStories() {
    return this.storiesService.getAll();
  }

  @Post()
  createStory(@Req() req, @Body() dto: CreateStoryDto) {
    return this.storiesService.create(req.user.id, dto);
  }
}
