import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // ---------------------- Suggestions ----------------------
  // Exclut l'utilisateur courant
  async findAllSuggestions(userId: string) {
    return this.prisma.user.findMany({
      where: { id: { not: userId } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        city: true,
        province: true,
      },
      take: 5,
    });
  }

  // ---------------------- Recherche par query ----------------------
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
      take: 10,
    });
  }

  // ---------------------- Suivre un utilisateur ----------------------
  async followUser(userId: string, targetId: string) {
    const existing = await this.prisma.follow.findFirst({
      where: { followerId: userId, followingId: targetId },
    });
    if (existing) return existing;

    return this.prisma.follow.create({
      data: { followerId: userId, followingId: targetId },
    });
  }

  // ---------------------- Récupérer un profil complet ----------------------
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        city: true,
        province: true,
        followers: { select: { followerId: true } },
        following: { select: { followingId: true } },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  // ---------------------- Compter les abonnements ----------------------
  // Renvoie le nombre d'utilisateurs suivis par userId
  async getSubscriptionsCount(userId: string) {
    const count = await this.prisma.follow.count({
      where: { followerId: userId },
    });
    return { count };
  }

  // ---------------------- Marquer utilisateur en ligne/offline ----------------------
  async setUserOnlineStatus(userId: string, online: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { online },
    });
  }
}