import { Controller, Get, Post, Body } from '@nestjs/common';
import { StoriesService } from './stories.service';

@Controller('stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @Get()
  async getStories() {
    return this.storiesService.getAll();
  }

  @Post()
  async createStory(@Body() body: { userId: string; imageUrl: string }) {
    return this.storiesService.create(body.userId, body.imageUrl);
  }
}
