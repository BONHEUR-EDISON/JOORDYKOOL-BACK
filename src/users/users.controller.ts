// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('top-users')
  getTopUsers() {
    return this.userService.getTopUsers();
  }

  @Get('suggestions')
  getSmartSuggestions(@Req() req) {
    return this.userService.smartSuggestions(req.user.id);
  }

  @Get('basic-suggestions')
  getBasicSuggestions(@Req() req) {
    return this.userService.basicSuggestions(req.user.id);
  }

  @Get('search')
  searchUsers(@Query('query') query: string) {
    return this.userService.searchUsers(query);
  }

  @Post(':id/follow')
  toggleFollow(@Param('id') targetId: string, @Req() req) {
    return this.userService.toggleFollow(req.user.id, targetId);
  }

  @Post(':id/online')
  setOnlineStatus(@Param('id') id: string, @Body('online') online: boolean) {
    return this.userService.setUserOnlineStatus(id, online);
  }

  @Get(':id/follow-stats')
  getFollowStats(@Param('id') id: string) {
    return this.userService.getFollowStats(id);
  }

  @Get(':id')
  getUserProfile(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
}
