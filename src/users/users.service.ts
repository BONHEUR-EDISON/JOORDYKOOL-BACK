// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // ---------------- PROFIL UTILISATEUR ----------------
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        city: true,
        province: true,
        online: true,
        followers: { select: { followerId: true } },
        following: { select: { followingId: true } },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  // ---------------- FOLLOW / UNFOLLOW ----------------
  async toggleFollow(userId: string, targetId: string) {
    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: userId, followingId: targetId },
      },
    });

    if (existing) {
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: { followerId: userId, followingId: targetId },
        },
      });
      return { following: false };
    }

    await this.prisma.follow.create({
      data: { followerId: userId, followingId: targetId },
    });
    return { following: true };
  }

  // ---------------- ONLINE STATUS ----------------
  async setUserOnlineStatus(userId: string, online: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { online },
    });
  }

  // ---------------- SUGGESTIONS ----------------
  async basicSuggestions(userId: string) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId).concat(userId);

    return this.prisma.user.findMany({
      where: { id: { notIn: followingIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        city: true,
        province: true,
      },
      take: 10,
    });
  }

  async smartSuggestions(userId: string) {
    const myFollowing = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = myFollowing.map((f) => f.followingId);

    const secondDegree = await this.prisma.follow.findMany({
      where: { followerId: { in: followingIds } },
      select: { followingId: true },
    });

    const suggestionsIds = [
      ...new Set(secondDegree.map((f) => f.followingId)),
    ].filter((id) => id !== userId && !followingIds.includes(id));

    const users = await this.prisma.user.findMany({
      where: { id: { in: suggestionsIds } },
      include: { followers: true },
    });

    return users
      .map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        avatarUrl: u.avatarUrl,
        city: u.city,
        province: u.province,
        followersCount: u.followers.length,
      }))
      .sort((a, b) => b.followersCount - a.followersCount)
      .slice(0, 10);
  }

  // ---------------- RECHERCHE ----------------
  async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        city: true,
        province: true,
      },
      take: 20,
    });
  }

  // ---------------- STATS ----------------
  async getFollowStats(userId: string) {
    const [followers, following] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { followers, following };
  }

  // ---------------- TOP USERS ----------------
  async getTopUsers(limit = 10) {
    const users = await this.prisma.user.findMany({
      include: { followers: true },
    });
    return users
      .map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        avatarUrl: u.avatarUrl,
        followersCount: u.followers.length,
      }))
      .sort((a, b) => b.followersCount - a.followersCount)
      .slice(0, limit);
  }
}
