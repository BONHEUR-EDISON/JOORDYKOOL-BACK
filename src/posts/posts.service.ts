import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.post.findMany({
      include: {
        user: true,
        likes: true,
        comments: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, content: string) {
    return this.prisma.post.create({
      data: { content, userId },
      include: {
        user: true,
        likes: true,
        comments: { include: { user: true } },
      },
    });
  }

  async likePost(postId: string, userId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (existing) return existing;
    return this.prisma.like.create({ data: { postId, userId } });
  }

  async addComment(postId: string, userId: string, content: string) {
    return this.prisma.comment.create({
      data: { postId, userId, content },
      include: { user: true },
    });
  }
}
