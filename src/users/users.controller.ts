import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { UserService } from './users.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // ---------------------- Suggestions ----------------------
  @Get('suggestions')
  async getSuggestions(@Query('userId') userId: string) {
    return this.userService.findAllSuggestions(userId);
  }

  // ---------------------- Recherche ----------------------
  @Get('search')
  async searchUsers(@Query('query') query: string) {
    return this.userService.searchUsers(query);
  }

  // ---------------------- Suivre un utilisateur ----------------------
  @Post(':id/follow')
  async followUser(
    @Param('id') targetId: string,
    @Body('userId') userId: string,
  ) {
    return this.userService.followUser(userId, targetId);
  }

  // ---------------------- Profil par ID ----------------------
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  // ---------------------- Mettre à jour le statut en ligne ----------------------
  @Post(':id/online')
  async setOnlineStatus(
    @Param('id') userId: string,
    @Body('online') online: boolean,
  ) {
    return this.userService.setUserOnlineStatus(userId, online);
  }

  // ---------------------- Nombre d'abonnements ----------------------
  @Get(':id/subscriptions-count')
  async getSubscriptionsCount(@Param('id') userId: string) {
    return this.userService.getSubscriptionsCount(userId);
  }
}